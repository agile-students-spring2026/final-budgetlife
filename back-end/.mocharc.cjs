// Mocha configuration.
//
// friends.test.js currently requires `chai-http`, which is not installed
// (and chai-http v5 is ESM-only, incompatible with this commonjs project).
// Ignore it until that test is migrated to supertest or the dependency
// is added.
module.exports = {
  spec: "test/**/*.test.js",
  ignore: "test/friends.test.js",
};
