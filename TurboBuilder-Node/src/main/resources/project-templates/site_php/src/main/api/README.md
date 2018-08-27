- The project rest api will be accessed only by this entry point:

    http://host/api
    
- There will be 2 different ways to perform a request to the API
    
    1 - via post, sending an object containing the operation name and parameters
        - Multiple objects can be passed as an array to perform as many operations as we want
          in a single http request. Operations will be sequentially performed on server, and 
          responses will be returned in the same order as the operations were received.
    
    2 - via get, using the following format: 
        http://host/api/operation-full-name/parameter1/parameter2/parameter3/...
        
       
- Operations will be placed inside the api folder, using any folder structure. Each operation will be inside a file, which will be
  named with the operation name. For example:
  
    api/customers/create-customer.php
        will contain the create-customer operation.


- Operations that are saved as files on the api folder will take preference over the operations that may have been loaded by default
  or by an included dependency
  
- Any badly formatted request to the api, or a request to a non existing operation will result in a 404 error
