const documentFieldFormatHelper = ({ templateFields, documentFields }) => {
  const validFieldTypes = [
    "shortText",
    "longText",
    "dateTime",
    "select",
    "file",
    "image",
    "checkBox",
  ];

  const errors = []; // Array to collect all validation errors

  // Helper function to validate a single field array
  const validateFields = (fields, arrayName) => {
    for (const field of fields) {
      // Check that all required keys are present
      if (
        !field.key ||
        !field.label ||
        !field.fieldType ||
        field.maxChar == null ||
        field.minChar == null ||
        field.isRequired == null
      ) {
        errors.push(
          `In ${arrayName}: Field ${JSON.stringify(
            field
          )} is missing required keys.`
        );
      }

      // Check if fieldType is valid
      if (!validFieldTypes.includes(field.fieldType)) {
        errors.push(
          `In ${arrayName}: Field type "${field.fieldType}" is invalid for field ${field.key}.`
        );
      }

      // Check that maxChar and minChar are numbers and are within valid ranges
      if (
        typeof field.maxChar !== "number" ||
        typeof field.minChar !== "number"
      ) {
        errors.push(
          `In ${arrayName}: maxChar and minChar must be numbers for field ${field.key}.`
        );
      }

      // If the fieldType is "select", ensure options are provided and valid
      if (field.fieldType === "select") {
        if (!Array.isArray(field.options) || field.options.length === 0) {
          errors.push(
            `In ${arrayName}: Field ${field.key} of type "select" must have a non-empty "options" array.`
          );
        }
      }
    }
  };

  // Validate templateFields
  validateFields(templateFields, "templateFields");

  // Validate documentFields
  validateFields(documentFields, "documentFields");

  // If there are any errors, return them
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // If all fields are valid, return true (or an empty array)
  return { isValid: true, errors: [] };
};

module.exports = documentFieldFormatHelper;

// Example usage
const validationInput = {
  templateFields: [
    {
      key: "name",
      label: "Name",
      fieldType: "shortText",
      maxChar: 50,
      minChar: 1,
      isRequired: true,
    },
    {
      key: "category",
      label: "Category",
      fieldType: "select",
      options: ["Option 1", "Option 2"],
      maxChar: 50,
      minChar: 1,
      isRequired: true,
    },
  ],
  documentFields: [
    {
      key: "description",
      label: "Description",
      fieldType: "longText",
      maxChar: 300,
      minChar: 1,
      isRequired: true,
    },
    {
      key: "category",
      label: "Category",
      fieldType: "select",
      options: [], // This should trigger an error
      maxChar: 50,
      minChar: 1,
      isRequired: true,
    },
  ],
};
