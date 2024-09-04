This documentation provides detailed information about the p-Chip Cloud Service API. These APIs are designed for p-Chip authorized applications. Applications need to be registered with the p-Chip Cloud authentication platform, powered by Firebase.

<details>
  <summary><strong>Getting Started</strong></summary>

  - **Authentication**: Register your application with the p-Chip Cloud Service Firebase project.
  - **Set Up Your Tenant**: After registering your application, you will need an active tenant on the p-Chip Cloud platform. You can create your tenant in the **[p-Chip Cloud Web Portal](https://pchip-web-portal.azurewebsites.net/)**.
  - **Base URL**: The base URL for the API is <https://pcc-cloud-service.azurewebsites.net/api/v1/services>.

</details>

<details>
  <summary><strong>Definitions</strong></summary>

  **Explanation of commonly used terms in this documentation**

  - **User**: A user registered with p-Chip authentication services.
  - **Claims**: Claims are custom attributes that are added to Firebase Authentication tokens. These attributes are required for all routes excluding the **/verify-token** route. These claims include:
    - id: unique user id on the platform
    - uid: unique uid obtained from Firebase
    - name: user's name
    - email: user's email
    - tenantId: current tenant to which the user is logged in. **Note**: when users login, they will always be set to their default tenant.
    - tenantUserId: The unique identifier of the user within a tenant. **Note**: Users can be granted access to multiple tenants by the administrator of that tenant. Their access can be revoked at any time.
    - role: The role that the user has been assigned by a tenant. Options include: administrator (view all records within a tenant), manager (view all records within the tenant organizations they have been assigned to), individualContributor (view only those records that they have created)
    - tenantOrganizations: Array of tenant organizationsn to which the tenant user has been assigned. This access defines what **Documents** you have access to create and register using this service.
  - **Tenant**: A business or organization registered within the p-Chip Cloud Platform.
  - **Tenant Users**: Users registered with a tenant. A user can be associated with multiple tenants but can only access resources from the tenant with which they have authenticated.
  - **Tenant Organization**: A subgroup within a tenant. These groups can be organizations, departments, or divisions. These tenant organizations are required to create **Documents**.
  - **Documents**: Flexible database records designed to store both structured and unstructured data.
    - **Document Configuration**: Database records used to create reusable configurations for your documents. Standard configuration files include Products and Tests.
    - **Document Templates**: Implementations of document configuration files. These templates contain prefilled attributes, such as product names, descriptions, and images, defined by the Product Configuration files.
      - **Document Template Fields**: Prefilled document fields completed when a document template is created. For example, using a product configuration: `name: Widget A`, `description: This is a description of the widget`.
      - **Document Fields**: Editable fields completed when a document is created. For example: `Production Date: January 1, 2024`, `Batch Number: ABC-123`.
  - **Micro Transponder Identification Chip (MTIC)**: A p-Chip Micro-Transponder or crypto anchor attached to physical items. Read more about MTIC **[here](https://p-chip.com/solutions/)**.
    - **MTIC Reader**: A scanning device sold and distributed by p-Chip Corporation that reads the unique serial number of an MTIC.
    - **MTIC Session**: A date and time-based session generated when a user wants to read, write, or modify **documents**. This session contains the serial number of the **MTIC Reader**, the **Tenant User**, and the **Geographic Location** of the device being used.
    - **MTIC Document**: A physical item whose characteristics are defined in a **Document** to which an **MTIC** has been applied.

</details>

<details>
  <summary><strong>Features</strong></summary>

  - **Authentication**: Secure authentication for users registered with p-Chip services.
  - **Updating User Access with Claims**: Update your token to give you access to a tenants resources.
  - **Create, Read, and Update Documents**: CRUD operations for creating new documents from existing document templates that have been created by your tenant administrator.
  - **Generate MTIC Sessions**: Start and end MTIC Sessions.
  - **Create, read and update MTIC Documents**: CRUD operations for create MTIC documents using MTIC Sessions, Readers and Crypto Anchors.

</details>

<details>
  <summary><strong>How to use these API's</strong></summary>

  - **authenticate/login**: A demo account has been created with a default username, password, tenant and all other necessary related information to test the url routes. First login and then set the returned idToken in the authentication header. This is required for all other routes.
  - **user-requests/auth-user-details**: This route shows you the structure of the information you can store locally in your application. It consists of the users information, their default tenant, current logged in tenant (stored in the JWT token and used for access to all other routes).
  - **document-requests/org-documents**: The first step after logging in, your application should look for all documents that have been created that the user has access to view. This route has a default pagination of 25 records. **Note**: Documents are not the same as MTIC Documents. Documents can have multiple MTIC documents associated with them. This should be your default query, because it returns references to all the data the application user should need to access, while reducing server request volume.

  Available Actions
  - **Search by scanning an MTIC**: To search using an MTIC tag:
    - **/mtic-requests/start-mtic-session**: This route should be called when a user wants to scan and MTIC tag. The route returns an MTIC session ID. The MTIC session stores the unique identification of the MTIC Reader that is currently connected to your device and your geographical coordinates (lat: latitude, lon: longitude). When creating a session, the server performs the following actions:
      - Searches to see if the MTIC Reader has been registered on the p-Chip Cloud platform.
        - If it has not been registered, it will automatically register the MTIC Reader and assign it to the current Active Tenant stored in the authenticated user's custom claims.
        - Checks to see if the MTIC reader has been deactivated by the Tenant to which the device was initially registered. If the device has been deactivated, the user will recieve an error.
      - Creates an MTIC Session recording the MTIC reader identification number, the tenant user id and the lat/lon sent with the request and the date and time the session was created.
      - Returns the MTIC Session Id. This session id needs to be stored to be sent along with any MTIC Document post request.
    - **/mtic-requests/mtic/{id}/summary**: This route should be called when a user wants to scan multiple MTIC's. For scanning single MTIC's, please see the next step. The route returns the MTIC record which includes the following information:
      - MTIC Identification Number(id - String): 9-10 digit serial number of the MTIC.
      - Unique Identification Number (uid - String)
      - Primary MTIC document: The main document associated with a MTIC for a give tenant. When displaying results, use this data as the fields in a list
        - Document Template UID (for example: a SKU number)
        - Document Template Name (for example: a Product Name: Widget A)
        - Document Template Image (for example: a generic product image for a Widget A)
      - Document Configuration Name: (for example: Product)
    - **/mtic-requests/mtic/{id}/details**: This route should be called when a user wants to scan a single MTIC and view the details. The route returns the MTIC record which inlcludes the following information:
      - - MTIC Identification Number(id - String): 9-10 digit serial number of the MTIC.
      - Unique Identification Number (uid - String)
      - Primary MTIC document: The main document associated with a MTIC for a give tenant. When displaying results, use this data as the fields in a list
        - Document Template
          - Document Template UID (for example: a SKU number)
          - Document Template Name (for example: a Product Name: Widget A)
          - Document Template Image (for example: a generic product image for a Widget A)
        - Document Configuration Name: (for example: Product)
        - Header Fields: An array of fields that describe the related document template. Note that all schema values are in string format. Use the type to determine the appropriate way to display the field for your requirements. Each value in the array has the following schema:
            - key: A unique identifier for the field
            - type: An enum field type of options: shortText, longText, dateTime, select, checkBox
            - label: A string value that should be used as a lable for the field value
            - value: The value of the field in string format
        - Body Fields: An array of fields that are created when a Document is created. Use the type to determine the appropriate way to display the field for your requirements. Each value in the array has the following schema:
            - key: A unique identifier for the field
            - type: An enum field type of options: shortText, longText, dateTime, select, checkBox
            - label: A string value that should be used as a lable for the field value
            - value: The value of the field in string format
        - meta: This is metaData collected at the time that the record was created an udpated. It includes the following information:
          - CreatedAt: Date created in utc
          - CreatedBy: The name of the user who created the MTIC Document
          - Tenant: The tenant that created the MTIC Document
          - TenantOrganization: The name of the tenant organization that created the document
          - MTIC Session Details: This is the session data that was when the MTIC document was created. This includes the unique id of the session, MTIC Reader Id, location (lat, lon), startDateTime and endDateTime in UTC.
      - Related Documents: This is an array of non primary documents that have also been recorded with the requested tag, excluding the primary document. Such documents can include other tenants documents that they have allowed to be public, tests, or other information that has been recorded using the p-Chip Cloud and associated Micro Transponder Technology.
</details>

<details>
  <summary><strong>Contact Information</strong></summary>

  If you have any questions, please contact our support team at [support@p-chip.com](mailto:support@p-chip.com).

</details>

