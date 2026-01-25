
export const returnSaveCred = (userId: string, data: any): { success: boolean; error?: string; result?: any } => {
  if (!userId || !data) {
    return {
      success: false,
      error: "UserId or Data details not found for creating Credentials",
    };
  }

  if (data.name === "Telegram") {
    const res = {
      name: data.name,
      userId: userId,
    };
    return {
      success: true,
      result: res,
    };
  }

  return {
    success: true,
    result: { name: data.name, userId: userId },
  };
};
