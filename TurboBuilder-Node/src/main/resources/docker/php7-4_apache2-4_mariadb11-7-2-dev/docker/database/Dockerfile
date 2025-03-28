FROM mariadb:11.7.2

# Create MySQL log directory and set permissions
RUN mkdir -p /var/log/mysql && \
    chown -R mysql:mysql /var/log/mysql && \
    chmod 755 /var/log/mysql
    
# COPY my.cnf into the Docker image during build**
COPY my.cnf /etc/mysql/conf.d/my.cnf
