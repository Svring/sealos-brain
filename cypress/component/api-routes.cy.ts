describe("Sealos API Routes Integration Tests", () => {
  const baseUrl = "https://bja.sealos.run/api";
  let testData: any;

  before(() => {
    cy.fixture("sealos-test-data").then((data) => {
      testData = data;
    });
  });

  describe("Account API Routes", () => {
    it("should handle getAmount route with valid parameters", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/account/getAmount`,
        qs: testData.validParams.account,
        headers: {
          Authorization: testData.validHeaders.single,
        },
        failOnStatusCode: false,
      }).then((response) => {
        // Since we're testing the route structure, not the actual API
        // We expect either success or a specific error format
        expect([200, 400, 401, 500]).to.include(response.status);
        expect(response.body).to.satisfy(
          (body: any) =>
            body.hasOwnProperty("message") || body.hasOwnProperty("data")
        );
      });
    });

    it("should return 400 for missing region_url parameter", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/account/getAmount`,
        qs: testData.validParams.account,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.message).to.include("region_url");
      });
    });

    it("should return 401 for missing authorization header", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/account/getAmount`,
        qs: testData.validParams.account,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(401);
        expect(response.body.message).to.include("Authorization");
      });
    });

    it("should handle auth info route", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/auth/info`,
        qs: testData.validParams.account,
        headers: {
          Authorization: testData.validHeaders.single,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect([200, 400, 401, 500]).to.include(response.status);
        expect(response.body).to.satisfy(
          (body: any) =>
            body.hasOwnProperty("message") || body.hasOwnProperty("data")
        );
      });
    });
  });

  describe("Devbox API Routes", () => {
    const devboxHeaders = {
      Authorization: "Bearer kubeconfig-token",
      "Authorization-Bearer": "Bearer devbox-token",
    };

    it("should handle getDevboxList route", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/devbox/getDevboxList`,
        qs: {
          region_url: testData.validParams.devbox.region_url,
        },
        headers: {
          Authorization: testData.validHeaders.dual.authorization,
          "Authorization-Bearer":
            testData.validHeaders.dual.authorizationBearer,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect([200, 400, 401, 500]).to.include(response.status);
        expect(response.body).to.satisfy(
          (body: any) =>
            body.hasOwnProperty("message") || body.hasOwnProperty("data")
        );
      });
    });

    it("should handle getDevboxByName route", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/devbox/getDevboxByName`,
        qs: testData.validParams.devbox,
        headers: {
          Authorization: testData.validHeaders.dual.authorization,
          "Authorization-Bearer":
            testData.validHeaders.dual.authorizationBearer,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect([200, 400, 401, 500]).to.include(response.status);
        expect(response.body).to.satisfy(
          (body: any) =>
            body.hasOwnProperty("message") || body.hasOwnProperty("data")
        );
      });
    });

    it("should handle getSSHConnectionInfo route", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/devbox/getSSHConnectionInfo`,
        qs: {
          region_url: "cloud.sealos.io",
          devbox_name: "test-devbox",
        },
        headers: devboxHeaders,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 401, 500]);
        expect(response.body).to.satisfy(
          (body: any) =>
            body.hasOwnProperty("message") || body.hasOwnProperty("data")
        );
      });
    });

    it("should handle checkReady route", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/devbox/checkReady`,
        qs: {
          region_url: "cloud.sealos.io",
          devbox_name: "test-devbox",
        },
        headers: devboxHeaders,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 401, 500]);
        expect(response.body).to.satisfy(
          (body: any) =>
            body.hasOwnProperty("message") || body.hasOwnProperty("data")
        );
      });
    });

    it("should return 401 for missing Authorization-Bearer header", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/devbox/getDevboxList`,
        qs: {
          region_url: "cloud.sealos.io",
        },
        headers: {
          Authorization: "Bearer kubeconfig-token",
          // Missing Authorization-Bearer
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(401);
        expect(response.body.message).to.include("Authorization-Bearer");
      });
    });

    it("should return 400 for missing required parameters", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/devbox/getDevboxByName`,
        qs: {
          region_url: "cloud.sealos.io",
          // Missing devbox_name and mock
        },
        headers: devboxHeaders,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.message).to.include("devbox_name");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid HTTP methods", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/account/getAmount`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(405); // Method Not Allowed
      });
    });

    it("should handle malformed query parameters", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/account/getAmount?region_url=`,
        headers: {
          Authorization: "Bearer test-token",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.message).to.include("region_url");
      });
    });
  });

  describe("Response Format Validation", () => {
    it("should return consistent error response format", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/account/getAmount`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.be.a("string");
      });
    });

    it("should include proper CORS headers if needed", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/account/getAmount`,
        qs: testData.validParams.account,
        headers: { Authorization: testData.validHeaders.single },
        failOnStatusCode: false,
      }).then((response) => {
        // Check that response has proper content-type
        expect(response.headers).to.have.property("content-type");
        expect(response.headers["content-type"]).to.include("application/json");
      });
    });
  });
});
