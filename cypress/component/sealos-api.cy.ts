import { validateHeaders, validateQueryParams } from "../../src/lib/sealos-api";

describe("Sealos API Validation", () => {
  let testData: any;

  before(() => {
    cy.fixture("sealos-test-data").then((data) => {
      testData = data;
    });
  });

  describe("validateHeaders", () => {
    it("validates single authorization header", () => {
      const result = validateHeaders(testData.validHeaders.single);
      expect(result.isValid).to.be.true;
    });

    it("validates dual authorization headers", () => {
      const { authorization, authorizationBearer } = testData.validHeaders.dual;
      const result = validateHeaders(authorization, authorizationBearer);
      expect(result.isValid).to.be.true;
    });

    it("rejects missing authorization", () => {
      const result = validateHeaders(null);
      expect(result.isValid).to.be.false;
      expect(result.errorMessage).to.equal(testData.expectedErrors.missingAuth);
    });

    it("rejects missing bearer token", () => {
      const result = validateHeaders(testData.validHeaders.single, null);
      expect(result.isValid).to.be.false;
      expect(result.errorMessage).to.equal(
        testData.expectedErrors.missingBearerAuth
      );
    });
  });

  describe("validateQueryParams", () => {
    it("validates account parameters", () => {
      const result = validateQueryParams(testData.validParams.account, [
        "region_url",
      ]);
      expect(result.isValid).to.be.true;
    });

    it("validates devbox parameters", () => {
      const result = validateQueryParams(testData.validParams.devbox, [
        "region_url",
        "devbox_name",
        "mock",
      ]);
      expect(result.isValid).to.be.true;
    });

    it("rejects missing region_url", () => {
      const result = validateQueryParams(testData.invalidParams.missingRegion, [
        "region_url",
        "devbox_name",
      ]);
      expect(result.isValid).to.be.false;
      expect(result.errorMessage).to.include("region_url");
    });

    it("rejects empty parameters", () => {
      const result = validateQueryParams(testData.invalidParams.emptyRegion, [
        "region_url",
        "devbox_name",
      ]);
      expect(result.isValid).to.be.false;
      expect(result.errorMessage).to.include("region_url");
    });
  });
});
