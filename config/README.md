To install the microscopy database:

1. Install ERMrest

2. Follow ERMrest instructions to create a new catalog and find its dbname

3. Copy these files to the ermrest user

   ```
   sudo cp *.sql ~ermrest/
   ```

4. Switch to the ermrest user

   ```
   sudo su - ermrest
   ```

5. Create schema and OPTIONALLY load sample data

   ```
   psql dbname < setup.sql
   psql dbname < testdata.sql
   ```

6. Set permissions in the catalog

   ```
   psql dbname
   dbname=> set search_path=_ermrest;
   dbname=> update meta set value='*' where key='content_read_user' or key='read_user' or key='content_write_user';
   ```

   NOTE: using `'*'` opens the catalog up to all users with valid
   globusonline credentials. Replace `'*'` with the name of your
   globusonline group to restrict the catalog usage.

7. Deploy the ermrest_config.json

   Note: you may want to edit these settings. You may want to backup the original config.

   ```
   sudo cp ermrest_config.json ~ermrest/
   ```

8. Restart httpd

   ```
   sudo service httpd restart
   ```
