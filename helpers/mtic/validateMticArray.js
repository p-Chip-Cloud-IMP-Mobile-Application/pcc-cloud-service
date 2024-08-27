const validateMticArray = (mticArray) => {
  if (!Array.isArray(mticArray)) {
    return { isValid: false, message: "mtic must be an array" };
  }

  for (const item of mticArray) {
    if (typeof item !== "object" || item === null) {
      return {
        isValid: false,
        message: "Each item in mtic array must be an object",
      };
    }
    if (!item.hasOwnProperty("id") || typeof item.id !== "string") {
      return {
        isValid: false,
        message: "Each item in mtic array must have a string 'id' property",
      };
    }
    if (!item.hasOwnProperty("uid") || typeof item.uid !== "string") {
      return {
        isValid: false,
        message: "Each item in mtic array must have a string 'uid' property",
      };
    }
  }

  return { isValid: true };
};

module.exports = validateMticArray;
