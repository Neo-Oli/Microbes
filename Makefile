JS:= achievement.js entity.js food.js microbe.js microbes.js
CSS:= microbes.css
minify: vendor/autoload.php microbes.min.js microbes.min.css
microbes.min.js: $(JS)
	php -r "\
		require __DIR__ . '/vendor/autoload.php';\
		use MatthiasMullie\Minify;\
		\$$minifier = new Minify\JS();\
		foreach(explode(' ','$(JS)') as \$$file){\
			\$$minifier->add(\$$file);\
			}\
		\$$minifier->minify('$@');\
	"

microbes.min.css: microbes.css
	php -r "\
		require __DIR__ . '/vendor/autoload.php';\
		use MatthiasMullie\Minify;\
		\$$minifier = new Minify\CSS();\
		foreach(explode(' ','$(CSS)') as \$$file){\
			\$$minifier->add(\$$file);\
			}\
		\$$minifier->minify('$@');\
	"

.PHONY: clean
clean:
	rm -frv vendor
	rm -frv microbes.min.js
	rm -frv microbes.min.css

.PHONY: deps_update
deps_update:
	composer update
.PHONY: setup
setup: vendor/autoload.php

composer.lock: composer.json
	composer install
	touch $@
vendor/autoload.php: composer.lock
	composer install
	touch $@
