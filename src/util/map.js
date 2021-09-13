const convertMapToArray = function (map) {
  const array = [];

  for (let [key, value] of map.entries()) {
    array.push({ key, value });
  }

  return array;
};

const convertArrayToMap = function (array) {
  const map = new Map();

  for (const object of array) {
    map.set(object.key, object.value);
  }

  return map;
};

module.exports = {
  convertMapToArray,
  convertArrayToMap,
};
