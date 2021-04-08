const requestBaseUrl = {
  authorize : "http://localhost:10000",
  core: "http://localhost:9001",
  file: "http://localhost:9002",
  statistics: "http://localhost:9005",
  notice: "http://" + requestBaseUrl.webSockUrl,
  webSockUrl: "localhost:9004"
}

export default requestBaseUrl