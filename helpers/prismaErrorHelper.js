const prismaErrorHelper = (error) => {
  const prismaErrorMapping = {
    P2002: {
      statusCode: 409,
      message: "Unique constraint failed. The resource already exists.",
    },
    P2003: {
      statusCode: 400,
      message: "Foreign key constraint failed. Invalid reference provided.",
    },
    P2025: {
      statusCode: 404,
      message: "Record not found. The requested resource does not exist.",
    },
    P2005: {
      statusCode: 400,
      message: "Invalid data format for the given field.",
    },
    P2014: {
      statusCode: 409,
      message: "Violation of constraint, related records exist.",
    },
    P2016: {
      statusCode: 400,
      message: "Query is invalid, required fields are missing or incorrect.",
    },
    P2017: {
      statusCode: 404,
      message: "Record not found or access denied.",
    },
    P2018: {
      statusCode: 400,
      message: "Invalid arguments provided.",
    },
    P2004: {
      statusCode: 400,
      message: "Constraint failed on the database.",
    },
    P2019: {
      statusCode: 400,
      message: "Invalid database operation.",
    },
  };

  // Default case for unhandled Prisma errors
  const defaultError = {
    statusCode: 500,
    message: "Internal server error. Please try again later.",
  };

  return prismaErrorMapping[error.code] || defaultError;
};

module.exports = prismaErrorHelper;
