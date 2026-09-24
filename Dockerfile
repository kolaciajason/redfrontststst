FROM php:8.2-apache

# The php:*-apache base image can ship with multiple MPMs enabled, which makes
# Apache abort with "AH00534: More than one MPM loaded". mod_php requires prefork.
RUN a2dismod mpm_event mpm_worker 2>/dev/null; \
    rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.*; \
    a2enmod mpm_prefork rewrite headers

COPY . /var/www/html/

EXPOSE 80

CMD ["apache2-foreground"]
