gwis.zip: *.json *.js *.md *.txt
	zip -r $@ * -x .git/* -x Makefile
