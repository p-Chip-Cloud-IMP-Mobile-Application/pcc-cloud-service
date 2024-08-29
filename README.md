# pcc-cloud-service
p-Chip Cloud API service application

## Database Schema

This section provides an overview of the database schema for the application. The following models represent the core data structure, including their fields, relationships, and purposes.

---

### User

- **Description**: Represents a user registered and authenticated via Firebase.
- **Fields**:
  - `id` (`String`): Primary key, unique identifier.
  - `uid` (`String`): Firebase Auth UID, must be unique.
  - `name` (`String`): User's full name.
  - `email` (`String`): User's email address.
  - `defaultTenantUserId` (`String?`): Foreign key to the primary `TenantUser`.
  - `defaultTenantUser` (`TenantUser?`): Relation to the user's primary `TenantUser`.
  - `createdAt` (`DateTime`): Timestamp of user creation.
  - `updatedAt` (`DateTime`): Timestamp of the last update.
  - `tenantUsers` (`TenantUser[]`): One-to-many relation with `TenantUser`.

### Tenant

- **Description**: Represents a legal entity (company, organization, or other legal entity) registered to access the application.
- **Fields**:
  - `id` (`String`): Primary key, unique identifier.
  - `name` (`String`): Name of the tenant.
  - `website` (`String`): Tenant's website URL.
  - `logo` (`String`): Path to the tenant's logo.
  - `isActive` (`Boolean`): Indicates if the tenant is active.
  - `createdAt` (`DateTime`): Timestamp of tenant creation.
  - `updatedAt` (`DateTime`): Timestamp of the last update.
  - `tenantUsers` (`TenantUser[]`): One-to-many relation with `TenantUser`.
  - `documentConfig` (`DocumentConfig[]`): One-to-many relation with `DocumentConfig`.
  - `documentTemplates` (`DocumentTemplate[]`): One-to-many relation with `DocumentTemplate`.
  - `createdPublishedDocuments` (`PublishedDocument[]`): One-to-many relation for documents created by the tenant.
  - `ownedPublishedDocuments` (`PublishedDocument[]`): One-to-many relation for documents owned by the tenant.
  - `mticReaders` (`MTICReader[]`): One-to-many relation with `MTICReader`.
  - `tenantOrgs` (`TenantOrg[]`): One-to-many relation with `TenantOrg`.
  - `documents` (`Document[]`): One-to-many relation with `Document`.

### TenantUser

- **Description**: Represents users who have been granted access to tenant resources and data.
- **Fields**:
  - `id` (`String`): Primary key, unique identifier.
  - `userId` (`String?`): Foreign key to the `User`.
  - `user` (`User?`): Relation to the `User`.
  - `tenantId` (`String`): Foreign key to the `Tenant`.
  - `tenant` (`Tenant`): Relation to the `Tenant`.
  - `role` (`Role`): Role of the user within the tenant.
  - `isActive` (`Boolean`): Indicates if the tenant user is active.
  - `createdAt` (`DateTime`): Timestamp of tenant user creation.
  - `updatedAt` (`DateTime`): Timestamp of the last update.
  - `tenantOrgUser` (`TenantOrgUser[]`): One-to-many relation with `TenantOrgUser`.
  - `documents` (`Document[]`): One-to-many relation with `Document`.
  - `defaultUser` (`User?`): Relation to the `User`.
  - `mticSessions` (`MTICSession[]`): One-to-many relation with `MTICSession`.

  - **Unique Constraints**: `@@unique([userId, tenantId])`

### Role

- **Description**: Enumerates the top-level roles that define user permissions within a tenant.
- **Values**:
  - `administrator`: Can view everything within the tenant.
  - `manager`: Can view everything within the tenant organizations they are assigned.
  - `individual`: Can view only the records and documents that they create.

### TenantOrg

- **Description**: Represents a resource group within a tenant account.
- **Fields**:
  - `id` (`String`): Primary key, unique identifier.
  - `name` (`String`): Name of the tenant organization.
  - `parentId` (`String?`): Foreign key to the parent `TenantOrg`.
  - `parent` (`TenantOrg?`): Relation to the parent `TenantOrg`.
  - `tenantId` (`String`): Foreign key to the `Tenant`.
  - `tenant` (`Tenant`): Relation to the `Tenant`.
  - `createdAt` (`DateTime`): Timestamp of tenant organization creation.
  - `updatedAt` (`DateTime`): Timestamp of the last update.
  - `subOrgs` (`TenantOrg[]`): One-to-many self-relation to sub-organizations.
  - `tenantOrgUsers` (`TenantOrgUser[]`): One-to-many relation with `TenantOrgUser`.
  - `tenantOrgDocs` (`TenantOrgDoc[]`): One-to-many relation with `TenantOrgDoc`.
  - `documents` (`Document[]`): One-to-many relation with `Document`.

### TenantOrgUser

- **Description**: Defines the association between a `TenantUser` and a `TenantOrg`, applying specific rules and permissions.
- **Fields**:
  - `tenantOrgId` (`String`): Foreign key to the `TenantOrg`.
  - `tenantOrg` (`TenantOrg`): Relation to the `TenantOrg`.
  - `tenantUserId` (`String`): Foreign key to the `TenantUser`.
  - `tenantUser` (`TenantUser`): Relation to the `TenantUser`.
  - `permission` (`Permission`): Permission level within the organization.
  - `createdAt` (`DateTime`): Timestamp of creation.
  - `updatedAt` (`DateTime`): Timestamp of the last update.

  - **Primary Key**: `@@id([tenantOrgId, tenantUserId])`

### Permission

- **Description**: Enumerates the permissions a `TenantUser` can have within a `TenantOrg`.
- **Values**:
  - `read`
  - `write`
  - `delete`

### DocumentConfig

- **Description**: Specifies the type of documents (e.g., product, test) that a tenant wants to configure.
- **Fields**:
  - `id` (`String`): Primary key, unique identifier.
  - `name` (`String`): Name of the document type.
  - `description` (`String`): Description of the document type.
  - `fieldConfig` (`Json`): Configuration of the fields within the document.
  - `tenantId` (`String`): Foreign key to the `Tenant`.
  - `tenant` (`Tenant`): Relation to the `Tenant`.
  - `createdAt` (`DateTime`): Timestamp of creation.
  - `updatedAt` (`DateTime`): Timestamp of the last update.
  - `documentTemplates` (`DocumentTemplate[]`): One-to-many relation with `DocumentTemplate`.

### FieldTypes

- **Description**: Enumerates the different types of fields that can be configured in a document.
- **Values**:
  - `shortText`
  - `longText`
  - `dateTime`
  - `select`
  - `checkBox`

### DocumentTemplate

- **Description**: Prefilled templates following the rules defined by the `DocumentConfig`.
- **Fields**:
  - `id` (`String`): Primary key, unique identifier.
  - `name` (`String`): Name of the template.
  - `description` (`String`): Description of the template.
  - `image` (`String?`): Optional image associated with the template.
  - `documentConfigId` (`String`): Foreign key to the `DocumentConfig`.
  - `documentConfig` (`DocumentConfig`): Relation to the `DocumentConfig`.
  - `templateFieldConfig` (`Json`): Configuration of fields specific to this template.
  - `tenantId` (`String`): Foreign key to the `Tenant`.
  - `tenant` (`Tenant`): Relation to the `Tenant`.
  - `createdAt` (`DateTime`): Timestamp of creation.
  - `updatedAt` (`DateTime`): Timestamp of the last update.
  - `tenantOrgDocs` (`TenantOrgDoc[]`): One-to-many relation with `TenantOrgDoc`.
  - `documents` (`Document[]`): One-to-many relation with `Document`.

### TenantOrgDoc

- **Description**: Associates `DocumentTemplate` with specific `TenantOrg`, defining permissions for document creation.
- **Fields**:
  - `tenantOrgId` (`String`): Foreign key to the `TenantOrg`.
  - `tenantOrg` (`TenantOrg`): Relation to the `TenantOrg`.
  - `documentTemplateId` (`String`): Foreign key to the `DocumentTemplate`.
  - `documentTemplate` (`DocumentTemplate`): Relation to the `DocumentTemplate`.
  - `permission` (`Permission`): Permission level for the template within the organization.
  - `createdAt` (`DateTime`): Timestamp of creation.
  - `updatedAt` (`DateTime`): Timestamp of the last update.

  - **Primary Key**: `@@id([tenantOrgId, documentTemplateId])`

### Document

- **Description**: Represents documents created from templates, with additional information added during creation.
- **Fields**:
  - `id` (`String`): Primary key, unique identifier.
  - `uid` (`String`): Universally unique identifier for the document.
  - `documentTemplateId` (`String`): Foreign key to the `DocumentTemplate`.
  - `documentTemplate` (`DocumentTemplate`): Relation to the `DocumentTemplate`.
  - `tenantId` (`String?`): Foreign key to the `Tenant`, if applicable.
  - `tenant` (`Tenant?`): Relation to the `Tenant`.
  - `tenantOrgId` (`String`): Foreign key to the `TenantOrg`.
  - `tenantOrg` (`TenantOrg`): Relation to the `TenantOrg`.
  - `documentFields` (`Json`): JSON object storing the fields and values of the document.
  - `createdById` (`String`): Foreign key to the `TenantUser` who created the document.
  - `createdBy` (`TenantUser`): Relation to the `TenantUser`.
  - `createdAt` (`DateTime`): Timestamp of document creation.
  - `updatedAt` (`DateTime`): Timestamp of the last update.
  - `mticDocuments` (`MTICDocument[]`): One-to-many relation with `MTICDocument`.

### MTIC

- **Description**: Represents a Micro-transponder Identity Chip (MTIC) used for tracking documents.
- **Fields**:
  - `id` (`String`): Primary key, unique identifier.
  - `uid` (`String`): Universally unique identifier associated with the tracked document.
  - `createdAt` (`DateTime`): Timestamp of MTIC creation.
  - `updatedAt` (`DateTime`): Timestamp of the last update.
  - `publishedDocuments` (`PublishedDocument[]`): One-to-many relation with `PublishedDocument`.
  - `mticDocuments` (`MTICDocument[]`): One-to-many relation with `MTICDocument`.

### MTICReader

- **Description**: Represents a device designed to scan and read MTICs.
- **Fields**:
  - `id` (`String`): Primary key, unique identifier, representing the device's serial number.
  - `isActive` (`Boolean`): Indicates if the MTIC reader is active.
  - `tenantId` (`String?`): Foreign key to the `Tenant`, if applicable.
  - `tenant` (`Tenant?`): Relation to the `Tenant`.
  - `createdAt` (`DateTime`): Timestamp of MTICReader creation.
  - `updatedAt` (`DateTime`): Timestamp of the last update.
  - `mticSessions` (`MTICSession[]`): One-to-many relation with `MTICSession`.

### MTICSession

- **Description**: Represents a session where an MTICReader interacts with documents.
- **Fields**:
  - `id` (`String`): Primary key, unique identifier.
  - `mticReaderId` (`String`): Foreign key to the `MTICReader`.
  - `mticReader` (`MTICReader`): Relation to the `MTICReader`.
  - `tenantUserId` (`String`): Foreign key to the `TenantUser` who conducted the session.
  - `tenantUser` (`TenantUser`): Relation to the `TenantUser`.
  - `lat` (`Decimal`): Latitude of the session's location.
  - `lon` (`Decimal`): Longitude of the session's location.
  - `startDateTime` (`DateTime`): Timestamp when the session started.
  - `endDateTime` (`DateTime?`): Optional timestamp when the session ended.
  - `createdAt` (`DateTime`): Timestamp of session creation.
  - `updatedAt` (`DateTime`): Timestamp of the last update.
  - `mticDocuments` (`MTICDocument[]`): One-to-many relation with `MTICDocument`.

### MTICDocument

- **Description**: Represents the association between a document and one or more MTICs, recording events that link them.
- **Fields**:
  - `id` (`String`): Primary key, unique identifier.
  - `mticId` (`String?`): Foreign key to the `MTIC`.
  - `mtic` (`MTIC?`): Relation to the `MTIC`.
  - `mticSessionId` (`String?`): Foreign key to the `MTICSession`.
  - `mticSession` (`MTICSession?`): Relation to the `MTICSession`.
  - `documentId` (`String`): Foreign key to the `Document`.
  - `document` (`Document`): Relation to the `Document`.
  - `createdAt` (`DateTime`): Timestamp of document creation.
  - `updatedAt` (`DateTime`): Timestamp of the last update.

### Event

- **Description**: Enumerates the possible events that can occur with an MTIC.
- **Values**:
  - `create`
  - `read`
  - `update`
  - `delete`
  - `transfer`

### PublishedDocument

- **Description**: Represents a document that has been published and associated with an MTIC.
- **Fields**:
  - `id` (`String`): Primary key, unique identifier.
  - `uid` (`String`): Universally unique identifier for the published document.
  - `mticId` (`String`): Foreign key to the `MTIC`.
  - `mtic` (`MTIC`): Relation to the `MTIC`.
  - `documentJson` (`Json`): JSON object representing the document's content.
  - `createdById` (`String`): Foreign key to the `Tenant` that created the document.
  - `createdBy` (`Tenant`): Relation to the `Tenant` that created the document.
  - `ownerId` (`String`): Foreign key to the `Tenant` that owns the document.
  - `owner` (`Tenant`): Relation to the `Tenant` that owns the document.
  - `createdAt` (`DateTime`): Timestamp of document creation.


