gwis.zip: *.json *.js *.html *.md *.txt
	zip -r $@ * -x .git/* -x Makefile
