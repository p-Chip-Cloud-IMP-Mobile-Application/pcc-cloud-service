const prisma = require("../../config/prisma");

const validateMticReader = async (mticReaderId, tenantId) => {
  let mticReader = null;

  console.log("Mtic reader", mticReaderId);
  console.log("Tenant", tenantId);

  try {
    const existingMticReader = await prisma.mTICReader.findUnique({
      where: {
        id: mticReaderId,
      },
    });

    if (!existingMticReader) {
      mticReader = await prisma.mTICReader.create({
        data: {
          id: mticReaderId,
          tenantId: tenantId,
          isActive: true,
        },
      });
    } else {
      mticReader = existingMticReader;
    }
  } catch (error) {
    console.log(error);
  }

  return mticReader;
};

module.exports = validateMticReader;
