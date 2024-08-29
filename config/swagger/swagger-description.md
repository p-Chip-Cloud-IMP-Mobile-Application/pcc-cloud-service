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
  <summary><strong>Contact Information</strong></summary>

  If you have any questions, please contact our support team at [support@p-chip.com](mailto:support@p-chip.com).

</details>

