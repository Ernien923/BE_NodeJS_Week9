// 檢查是否為空字串
const isStringValid = (value) => {
  return typeof value === "string" && value.trim() !== "";
};

// 檢查是否為整數，並且大於等於0
const isInteger = (number) => {
  return typeof number === "number" && Number.isInteger(number) && number >= 0;
};

// 檢查密碼是否符合格式 (至少含一個大寫英文、小寫英文及一個數字，長度為 8-16)
const isPasswordValid = (value) => {
  return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)\S{8,16}$/.test(value);
};

// 檢查是否為正確 uuid 格式
const isUUIDValid = (value) => {
  // XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  return /^[a-z0-9]{8}-[a-z0-9]{4}-4[a-z0-9]{3}-[89abAB][a-z0-9]{3}-[a-z0-9]{12}$/.test(
    value,
  );
};

module.exports = {
  isStringValid,
  isInteger,
  isPasswordValid,
  isUUIDValid,
};
