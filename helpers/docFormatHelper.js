const docFormatHelper = (fieldConfig, fieldValues) => {
  console.log("Field Config", fieldConfig);
  console.log("Field Values", fieldValues);
  const validFieldTypes = [
    "shortText",
    "longText",
    "dateTime",
    "select",
    "file",
    "image",
    "checkBox",
  ];

  const errors = []; // Array to store validation errors
  const formattedFields = []; // Array to store the formatted field values

  // Helper function to check if a value is a valid dateTime
  const isValidDateTime = (value) => {
    console.log("value", value);
    return !isNaN(Date.parse(value));
  };

  // Iterate over the fieldConfig to validate each corresponding fieldValue
  fieldConfig.forEach((config) => {
    const correspondingValue = fieldValues.find(
      (field) => field.key === config.key
    );

    // Check if the field is required but missing
    if (
      config.isRequired &&
      (!correspondingValue ||
        correspondingValue.value === undefined ||
        correspondingValue.value === null ||
        correspondingValue.value === "")
    ) {
      errors.push(`Field "${config.label}" is required.`);
      return;
    }

    // If the field is present, validate its value according to its type
    if (correspondingValue) {
      const value = correspondingValue.value;

      switch (config.fieldType) {
        case "shortText":
        case "longText":
          if (typeof value !== "string") {
            errors.push(`Field "${config.label}" should be a string.`);
          } else if (
            value.length < config.minChar ||
            value.length > config.maxChar
          ) {
            errors.push(
              `Field "${config.label}" must be between ${config.minChar} and ${config.maxChar} characters.`
            );
          } else {
            formattedFields.push({
              key: config.key,
              label: config.label,
              type: config.fieldType,
              value: value,
            });
          }
          break;

        case "dateTime":
          if (!isValidDateTime(value)) {
            errors.push(
              `Field "${config.label}" must be a valid date and time.`
            );
          } else {
            formattedFields.push({
              key: config.key,
              label: config.label,
              type: config.fieldType,
              value: value,
            });
          }
          break;

        case "select":
          if (!config.options.includes(value)) {
            errors.push(
              `Field "${
                config.label
              }" must be one of the following options: ${config.options.join(
                ", "
              )}.`
            );
          } else {
            formattedFields.push({
              key: config.key,
              label: config.label,
              type: config.fieldType,
              value: value,
            });
          }
          break;

        case "file":
        case "image":
          if (typeof value !== "string") {
            errors.push(
              `Field "${config.label}" should be a valid file/image path or identifier.`
            );
          } else {
            formattedFields.push({
              key: config.key,
              label: config.label,
              type: config.fieldType,
              value: value,
            });
          }
          break;

        case "checkBox":
          if (typeof value !== "boolean") {
            errors.push(`Field "${config.label}" should be a boolean.`);
          } else {
            formattedFields.push({
              key: config.key,
              label: config.label,
              type: config.fieldType,
              value: value,
            });
          }
          break;

        default:
          errors.push(
            `Field "${config.label}" has an unknown field type "${config.fieldType}".`
          );
          break;
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    fields: errors.length === 0 ? formattedFields : [],
  };
};

module.exports = docFormatHelper;
