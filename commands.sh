export SECRETS_PATH="$PROJECT_PATH/.secrets"
source $SECRETS_PATH/vars.sh

export DATA_FOLDER="$PROJECT_PATH/data"

edit(){
	cd $PROJECT_PATH/editor
	python ./main.py "$@"
}

preview(){
	cd $PROJECT_PATH/site
	python ./main.py "$@"
}






