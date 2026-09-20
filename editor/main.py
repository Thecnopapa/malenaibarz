import os, sys, requests, subprocess, sqlite3, json
from flask import Flask, request, make_response, render_template, redirect, send_from_directory, abort
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix

from codecs import decode

print(" * Starting editor service...")


app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app)
app.secret_key = bytes(os.environ["FLASK_KEY"], "UTF-8")
admin_login=os.environ["EDITOR_LOGIN"]
admin_password=os.environ["EDITOR_PASSWORD"]
secrets_folder=os.environ["SECRETS_PATH"]
data_folder=os.environ["DATA_FOLDER"]
domain = os.environ["EDITOR_DOMAIN"]

BLUE="\33[94m"
YELLOW="\33[93m"
GREEN="\33[92m"
CYAN="\33[96m"
ORANGE="\33[38;5;214m"
RED="\33[91m"
BOLD="\33[1m"
ITALIC="\33[3m"
EC="\33[0m"

HTTP=True

print(" * Flask initialised")


def check_auth(user=None, password=None):
    if user is None and password is None:
        user = request.cookies.get("user", None)
        password = request.cookies.get("password", None)
    if user == admin_login:
        if password==admin_password:
            print(" * Auth succesfull:", user)
            return True
    return False

@app.before_request
def before_request():
    open(os.path.join(secrets_folder, ".blacklist"), "a")
    with open(os.path.join(secrets_folder, ".blacklist"), "r") as bl:
        for line in bl:
            if line.replace("\n", "") == request.remote_addr:
                print(YELLOW, "IP in blacklist:", request.remote_addr, EC)
                abort(403)
                return "Blacklisted", 403

    with open(os.path.join(secrets_folder, ".blacklist"), "a") as bl:
        if request.path.endswith(".env") or request.path.endswith(".php"):
            bl.write(f"{request.remote_addr}\n")
            print(f"{RED}BLACKLISTED:", request.remote_addr, EC)

    
    print(f"{request.remote_addr} (http{'s' if request.is_secure else ' '})> {request.method.upper()}: {request.path}")
    
    if (not request.is_secure) and (not HTTP):
        print("Redirecting to https...")
        url = request.url.replace('http://', 'https://', 1)
        code = 301
        return redirect(url, code=code)

    if not check_auth() and "login" not in request.path:
        resp = redirect("/login")
        return resp, 403


@app.after_request
def after_request(response):
    code = response.status_code
    code_type = code // 100 
    col = EC
    if code_type == 5:
        col = RED
    elif code == 404:
        col = YELLOW
    elif code_type == 4:
        col = ORANGE
    elif code_type == 3:
        col = BLUE
    elif code_type == 2:
        col = GREEN
    print(f"{col}{request.remote_addr} ({response.status_code})> {request.method.upper()}: {request.path} > {response.content_type.split(";")[0]}", EC) 
    return response

@app.route("/static/<file>")
def return_static(file):
    file = secure_filename(file)
    return send_from_directory("static", file)




    
class Layout(object):
    def __init__(self, element):
        self.element = element
        self.elements = {}
        self.structure = {}
        self.counter = 0
        self.element.counter = f"e{self.counter}"
        self.structure = {self.element.counter:{}}
        self._tree = [self.element.counter]

        print("Building layout...")
        self.build()
        print(json.dumps(self.structure, indent=4))

    def json(self, indent=None):
        return json.dumps(self.structure, indent=indent)

    def build(self, element=None):
        
        if element is None:
            element = self.element

        for child in element.elements:
            self.counter += 1
            e = Element(child)
            e.counter = f"e{self.counter}"
            self.elements[e.counter] = e
            element.children.append(e)
            e.parent = element

            target = self.structure
            for k in self._tree:
                target = target[k]
            target[e.counter] = {}
            self._tree.append(e.counter)
            self.build(element=e)
            self._tree = self._tree[:-1]

        return self

    def render(self, headers=False, preview=False, depth=0):
        return self.element.render(headers=headers, preview=preview, depth=depth)





class Element(object):
    def __init__(self, element):
        self.type = element.get("type", "div")
        self.content = element.get("content", "")
        self.id = element.get("id", "")
        self.classlist = element.get("classlist", "")
        self.style = element.get("style", {})
        self.elements = element.get("elements", [])
        self.imports = element.get("imports", [])

        self.children = []
        self.parent = None
        self.counter = None


    def get_tree(self, tree=None):
        if tree is None:
            tree = []
        tree.append(self.id)
        self.parent.get_tree(tree=tree)
        return tree

    def process_style(self):
        style = ""
        for k, v in self.style.items():
            style+= f"{k}:{v};"
        return style

    def render(self, headers=False, preview=False, depth=0, counter=None):
        html=""
        indent=" "*depth
        if headers:
            if preview:
                html += indent+'<meta name="viewport" content="width=700 height=300 , initial-scale=0.01"/>\n'
        for i in self.imports:
            if i.endswith(".css"):
                html += indent + f"<link href='/static/{i}' rel='stylesheet'>\n"
            elif i.endswith(".js"):
                html += indent+f'<script defer type="text/javascript" src="/static/{i}"></script>\n'

        html += indent + f"<{self.type} id='{self.id}' counter='{self.counter}' class='{self.classlist}' style='{self.process_style()}'>\n"
        html += indent + self.content + "\n"
        for child in self.children:
            html += child.render(depth=depth+1, preview=preview)
        html += indent + f"</{self.type}>\n"

        return html

class Page(object):
    def __init__(self, page_id):
        self.data = json.load(open(os.path.join(data_folder, page_id+".page.json")))
        self.id = page_id

        self.layout = Layout(Element(self.data))

    def __getattr__(self, attr):
        return self.data.get(attr, None)

    def render(self, headers=True, preview=False):

        return self.layout.render(preview=preview, headers=headers)




def parse_pages():
    pages = []
    for file in os.listdir(data_folder):
        if file.endswith(".page.json"):
            page_id = file.split(".")[0]
            pages.append(Page(page_id))
    return pages


@app.get("/page/<page>")
def view_page(page):
    return Page(page).render()

@app.get("/preview/<page>")
def preview_page(page):
    return Page(page).render(preview=True)

@app.get("/edit/<page>")
def edit_page(page):
    return render_template("editor.html", page=Page(page))


@app.get("/")
def redirect_to_dashboard():
    return redirect("/dashboard")

@app.get("/dashboard")
def dashboard():

    return render_template("dashboard.html", pages=parse_pages())


@app.route("/login")
def login_page():
    return render_template("login.html")




@app.post("/auth/login")
def login_request():
    print(dir(request))
    data = request.form
    user = data.get("user")
    password = data.get("password")
    print(data)
    if check_auth(user, password):
        resp = redirect("/")
        resp.set_cookie("user", user)
        resp.set_cookie("password", password)
        return resp, 303
    else:
        resp = redirect("/login")
        return resp, 403

@app.route("/auth/logout")
def logout():
    resp = redirect("/login")
    resp.delete_cookie("user")
    resp.delete_cookie("password")
    return resp, 303







@app.route("/.well-known/acme-challenge/<file>")
def cert_validation(file):
    return send_from_directory(".well-known/acme-challenge", file)


if __name__ == "__main__":
    if "--http" in sys.argv:
        HTTP=True
    if HTTP:
        app.run(port=8080, host="0.0.0.0", debug="--debug" in sys.argv)
    else:
        app.run(port=8080, host="0.0.0.0", debug="--debug" in sys.argv, ssl_context=(f".certbot/config/live/{domain}/fullchain.pem", f".certbot/config/live/{domain}/privkey.pem"))