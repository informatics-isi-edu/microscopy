To install this web serivce:

1. Install this package

   ```
   cd rest
   sudo python setup.py install
   ```

2. Install the wsgi application

   ```
   sudo cp microscopy.wsgi /usr/lib/python2.6/site-packages/microscopy/microscopy.wsgi
   ```

   NOTE: make sure that microscopy.wsgi has executable permission bit set

3. Install the wsgi configuration

   ```
   sudo cp wsgi_microscopy.conf /etc/httpd/conf.d
   ```

4. Update your httpd/conf with directives matching or similar to the examples

   ```
   cat examples/httpd.conf
   ```

5. Update your httpd/conf.d/ssl.conf with directives matching or similar to

   ```
   cat examples/ssl.conf
   ```

6. Restart httpd

   ```
   sudo service httpd restart
   ```
