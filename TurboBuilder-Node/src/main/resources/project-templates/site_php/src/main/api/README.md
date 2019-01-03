- The project rest api will be accessed only by this entry points:

    http://host/api/site/ (To access the website API)
    http://host/api/server/ (To access the API for a server only project)
    http://host/api/othername/ (To access the API for libraries or other projects)
    
    
- There will be 2 different ways to perform a request to the API
    
    1 - via post, sending an object containing the operation name and parameters
        - Multiple objects can be passed as an array to perform as many operations as we want
          in a single http request. Operations will be sequentially performed on server, and 
          responses will be returned in the same order as the operations were received.
    
    2 - via get, using the following format: 
        http://host/api/site/operation/path/operation-full-name/parameter1/parameter2/...
        http://host/api/server/operation/path/operation-full-name/parameter1/parameter2/...
        http://host/api/othername/operation/path/operation-full-name/parameter1/parameter2/...
        
       
- Operations will be placed inside the api folder, using any folder structure. Each operation will be inside a file, which will be
  named with the operation name. For example:
  
    api/customers/create-customer.php
        will contain the create-customer operation.
 
- Any badly formatted request to the api, or a request to a non existing operation will result in a 404 error
