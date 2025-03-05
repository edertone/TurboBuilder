FROM php:8.4.4-apache

# Test installed modules with this command: docker compose exec web-app php -m

# INSTALL XDEBUG
RUN pecl install xdebug-3.4.1 && rm -r /tmp/pear/*
RUN docker-php-ext-enable xdebug

# Install and update additional PHP extensions or tools
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    openssl \
    && docker-php-ext-install zip mysqli
    
# Enable required apache modules: SSL, mod_rewrite, mod_expires, mod_headers, mod_deflate
RUN a2enmod ssl && a2enmod rewrite && a2enmod expires && a2enmod headers && a2enmod deflate

# Copy self signed certificates. They have been created inside the container terminal with
# the following command, that gives 10 years expiration:
# openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes -keyout localhost.key -out localhost.crt -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:10.0.0.1"
COPY self-signed-certificate/localhost.crt /etc/apache2/ssl/localhost.crt
COPY self-signed-certificate/localhost.key /etc/apache2/ssl/localhost.key

# Enable the APACHE custom global configuration
COPY apache.conf /etc/apache2/conf-available
RUN a2enconf apache.conf

# Enable the production configuration PHP.ini
# we can also use the development settings by replaciong this with php.ini-development
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Add our custom configurations
# On php the custom ini configurations need to be copied into conf.d 
COPY php.ini "$PHP_INI_DIR/conf.d/php-custom.ini"

# Copy the phpunit library to /var/www
# Copy the phpdocumentor library to /var/www
COPY phpunit.phar /var/www/phpunit.phar
COPY phpDocumentor.phar /var/www/phpDocumentor.phar