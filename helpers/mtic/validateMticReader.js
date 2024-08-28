const prisma = require("../../config/prisma");

const validateMticReader = async (mticReaderId, tenantId) => {
  let mticReader;

  try {
    const existingMticReader = await prisma.mTICReader.findUnique({
      where: {
        id: mticReaderId,
      },
    });

    if (!existingMticReader) {
      const newMticReader = await prisma.mTICReader.create({
        data: {
          id: mticReaderId,
          tenantId: tenantId,
          isActive: true,
        },
      });
      mticReader = newMticReader;
    }

    mticReader = existingMticReader;
  } catch (error) {
    console.log(error);
    return mticReader;
  }
};

module.exports = validateMticReader;
