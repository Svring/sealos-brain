describe("Devbox API Routes - Dedicated Tests", () => {
  const baseUrl = "http://127.0.0.1:3000/api/sealos/devbox";
  let testData: any;

  before(() => {
    cy.fixture("devbox-test-data").then((data) => {
      testData = data;
    });
  });

  const getRequestOptions = (endpoint: string) => {
    const { regionUrl, devboxHeaders, endpoints } = testData;
    const endpointData = endpoints[endpoint] || {};
    return {
      headers: devboxHeaders,
      qs: {
        regionUrl,
        ...(endpointData.qs || {}),
      },
      body: endpointData.body,
    };
  };

  const expectGenericApiResponse = (response: Cypress.Response<any>) => {
    expect([200, 400, 401, 404, 405, 500, 409]).to.include(response.status);
    if (response.status !== 200) {
      expect(response.body).to.have.property("message");
    }
  };

  it("POST /createDevbox", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/createDevbox`,
      ...getRequestOptions("createDevbox"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  it("GET /getDevboxList", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/getDevboxList`,
      ...getRequestOptions("getDevboxList"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  it("GET /getDevboxByName", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/getDevboxByName`,
      ...getRequestOptions("getDevboxByName"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  it("GET /getSSHConnectionInfo", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/getSSHConnectionInfo`,
      ...getRequestOptions("getSSHConnectionInfo"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  it("GET /checkReady", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/checkReady`,
      ...getRequestOptions("checkReady"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  it("POST /startDevbox", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/startDevbox`,
      ...getRequestOptions("startDevbox"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  it("POST /shutdownDevbox", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/shutdownDevbox`,
      ...getRequestOptions("shutdownDevbox"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  it("DELETE /delDevboxVersionByName", () => {
    cy.request({
      method: "DELETE",
      url: `${baseUrl}/delDevboxVersionByName`,
      ...getRequestOptions("delDevboxVersionByName"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  it("POST /editDevboxVersion", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/editDevboxVersion`,
      ...getRequestOptions("editDevboxVersion"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  it("POST /releaseDevbox", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/releaseDevbox`,
      ...getRequestOptions("releaseDevbox"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  it("POST /restartDevbox", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/restartDevbox`,
      ...getRequestOptions("restartDevbox"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  it("POST /updateDevbox", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/updateDevbox`,
      ...getRequestOptions("updateDevbox"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  it("GET /getAppsByDevboxId", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/getAppsByDevboxId`,
      ...getRequestOptions("getAppsByDevboxId"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  it("GET /getDevboxPodsByDevboxName", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/getDevboxPodsByDevboxName`,
      ...getRequestOptions("getDevboxPodsByDevboxName"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  it("GET /getDevboxVersionList", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/getDevboxVersionList`,
      ...getRequestOptions("getDevboxVersionList"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  it("GET /getEnv", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/getEnv`,
      ...getRequestOptions("getEnv"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });

  // --- Deletion should be tested last ---
  it("DELETE /delDevbox", () => {
    cy.request({
      method: "DELETE",
      url: `${baseUrl}/delDevbox`,
      ...getRequestOptions("delDevbox"),
      failOnStatusCode: false,
    }).then(expectGenericApiResponse);
  });
});
