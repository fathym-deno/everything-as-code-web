import {
  AzureAISearchQueryType,
  AzureAISearchVectorStore,
  AzureChatOpenAI,
  AzureOpenAIEmbeddings,
  ChatPromptTemplate,
  createRetrievalChain,
  createStuffDocumentsChain,
  PDFLoader,
  RecursiveCharacterTextSplitter,
} from "../test.deps.ts";

try {
  const generateVectorStore = false;

  const embeddings = new AzureOpenAIEmbeddings({
    azureOpenAIEmbeddingsApiDeploymentName: Deno.env.get(
      "AZURE_OPENAI_API_EMBEDDING_DEPLOYMENT_NAME",
    ),
  });

  const vectorStore = new AzureAISearchVectorStore(embeddings, {
    search: {
      type: AzureAISearchQueryType.SimilarityHybrid,
    },
  });

  if (generateVectorStore) {
    const loader = new PDFLoader(
      "./training/azure/data-explorer/azure-data-explorer.pdf",
      {
        // splitPages: false,
      },
    );

    const docs = await loader.load();

    console.log(`Loaded document with ${docs.length} total pages`);

    const kqlOverviewStartPage = 958;

    const kqlOverviewEndPage = 2985;

    const kqlDocs = docs.filter(
      (doc) =>
        doc.metadata.loc.pageNumber >= kqlOverviewStartPage &&
        doc.metadata.loc.pageNumber <= kqlOverviewEndPage,
    );

    console.log(
      `Loaded document with ${kqlDocs.length} total pages of KQL information`,
    );

    const splitter = new RecursiveCharacterTextSplitter();

    const docOutput = await splitter.splitDocuments(docs);

    console.log(
      `Generated ${docOutput.length} split documents for vector store.`,
    );

    const docsToAdd = docOutput; //.slice(1000, 1250);

    await vectorStore.addDocuments(docsToAdd);

    console.log(`Generated vector store with ${docsToAdd.length} documents`);

    const resultOne = await vectorStore.similaritySearch("Tumbling Window", 5);

    console.log(JSON.stringify(resultOne, null, 2));
  }

  const model = new AzureChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.7,
    // maxTokens: 1000,
    maxRetries: 5,
    verbose: true,
  });

  const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an expert data engineer, data scientist, and will help the user create a KQL query. You will provide only the KQL query in your responses. Keeping in mind the following context:\n\n{context}",
    ],
    [
      "ai",
      "Hello, i'm here to help you with your KQL query. What is your table schema",
    ],
    ["human", "The table schema is {tableSchema}"],
    ["ai", "Do you have an example of what your data is?"],
    ["human", "Here is an example of my data for each device: {payload}"],
    ["ai", "What DeviceIDs will we be working with?"],
    ["human", "{deviceIds}"],
    ["human", "Can you provide me with some KQL queries to use?"],
    ["ai", "{examples}"],
    ["ai", "I will keep these queries in mind, what would you like help with?"],
    ["human", "{input}"],
    // ['ai', `{query1}`],
    // [
    //   'human',
    //   `We got the following error, please fix the query, and return only the new KQL: {error1}`,
    // ],
    // ['ai', `{query2}`],
    // [
    //   'human',
    //   `We got the following error, please fix the query, and return only the new KQL: {error2}`,
    // ],
    // ['ai', `{query3}`],
    // [
    //   'human',
    //   `We got the following error, please fix the query, and return only the new KQL: {error3}`,
    // ],
    // ['ai', `{query4}`],
    // [
    //   'human',
    //   `We got the following error, please fix the query, and return only the new KQL: {error4}`,
    // ],
    // ['ai', `{query5}`],
    // [
    //   'human',
    //   `We got the following error, please fix the query, and return only the new KQL: {error5}`,
    // ],
  ]);

  const combineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: questionAnsweringPrompt,
  });

  const chain = await createRetrievalChain({
    retriever: vectorStore.asRetriever(),
    combineDocsChain,
  });

  // const response = await chain.invoke({
  //   input:
  //     'Write me a KQL query that shows the aggregated count of the RawData.counter in a tumbling window of 1 minute',
  //   tableSchema: `{"Name":"Devices","OrderedColumns":[{"Name":"DeviceID","Type":"System.String","CslType":"string"},{"Name":"EnqueuedTime","Type":"System.DateTime","CslType":"datetime"},{"Name":"MessageID","Type":"System.String","CslType":"string"},{"Name":"RawData","Type":"System.Object","CslType":"dynamic"}]}`,
  // });

  // const response = await chain.invoke({
  //   input: `Write me a KQL query that gets the most recent record, in json, for every device with an id of 'emotibit'. Return the whole record as json, not just RawData.`,
  //   tableSchema: `{"Name":"Devices","OrderedColumns":[{"Name":"DeviceID","Type":"System.String","CslType":"string"},{"Name":"EnqueuedTime","Type":"System.DateTime","CslType":"datetime"},{"Name":"MessageID","Type":"System.String","CslType":"string"},{"Name":"RawData","Type":"System.Object","CslType":"dynamic"}]}`,
  // });

  const question =
    "Write a KQL that uses the SensorMetadata.BatteryPercentage to predict when the device battery will die";

  const response = await chain.stream({
    input: question,
    tableSchema:
      `{"Name":"Devices","OrderedColumns":[{"Name":"DeviceID","Type":"System.String","CslType":"string"},{"Name":"EnqueuedTime","Type":"System.DateTime","CslType":"datetime"},{"Name":"MessageID","Type":"System.String","CslType":"string"},{"Name":"RawData","Type":"System.Object","CslType":"dynamic"}]}`,
    deviceIds: `['cytondevice','emotibit']`,
    examples: `let deviceIds = dynamic(['cytondevice','emotibit']);
    Devices
    | order by EnqueuedTime desc
    | where DeviceID in (deviceIds)
    | take 100`,
    rawDataFormat: `{ [deviceId]: [rawDataExample] }`,
    payload: JSON.stringify({
      DeviceID: "emotibit",
      EnqueuedTime: "2024-02-14T16:50:10.2360000Z",
      MessageID: "",
      RawData: {
        "iothub-connection-device-id": "emotibit",
        "iothub-enqueuedtime": "2024-02-14T16:50:10.2360000Z",
        DeviceID: "TrevorsEmotibit",
        DeviceType: "emotibit",
        DeviceData: { Timestamp: "1707929407" },
        SensorReadings: {
          EA: [
            { Data: 0.030175863, Millis: 0 },
            { Data: 0.030175863, Millis: 0 },
            { Data: 0.030175863, Millis: 200 },
          ],
          EL: [
            { Data: 26545, Millis: 0 },
            { Data: 26545, Millis: 0 },
            { Data: 26545, Millis: 200 },
          ],
          PI: [
            { Data: 6437, Millis: 0 },
            { Data: 6417, Millis: 0 },
            { Data: 6414, Millis: 0 },
            { Data: 6418, Millis: 159 },
          ],
          PR: [
            { Data: 7674, Millis: 0 },
            { Data: 7672, Millis: 0 },
            { Data: 7677, Millis: 0 },
            { Data: 7667, Millis: 159 },
          ],
          PG: [
            { Data: 1238, Millis: 0 },
            { Data: 1221, Millis: 0 },
            { Data: 1221, Millis: 0 },
            { Data: 1215, Millis: 159 },
          ],
        },
        SensorMetadata: {
          BatteryPercentage: 99,
          MACAddress: "58:f4:cc:7e:dc:0c",
          EmotibitVersion: "V01b",
        },
      },
    }),
    // query1: `
    // let deviceIds = dynamic(['cytondevice','emotibit']);
    // let AnomalyDetection = (series: dynamic) {
    //     series
    //     | extend (Timestamp, Value) = zip(series.Timestamp, series.Value)
    //     | mv-expand Timestamp to typeof(datetime), Value to typeof(double)
    //     | extend AnomalyDetection_SpikeAndDip(score, isAnomaly, isPositiveAnomaly, isNegativeAnomaly) = series_decompose_anomalies(Value, 95, 120, 'linefit')
    //     | where isAnomaly == 1
    //     | project-away score, isPositiveAnomaly, isNegativeAnomaly
    // };
    // Devices
    // | where DeviceID in (deviceIds)
    // | extend Readings = todynamic(RawData).SensorReadings
    // | mv-expand Readings
    // | extend SensorName = tostring(bag_keys(Readings)[0])
    // | extend ReadingValues = todynamic(Readings[SensorName])
    // | mv-expand ReadingValues
    // | extend Value = todouble(ReadingValues.Data)
    // | extend Millis = tolong(ReadingValues.Millis)
    // | extend DeviceTimestamp = tolong(todynamic(RawData).DeviceData.Timestamp)
    // | extend ActualTimestamp = datetime_add('millisecond', Millis, datetime(1970-01-01) + DeviceTimestamp * 1s)
    // | summarize make_list(pack('Timestamp', ActualTimestamp, 'Value', Value)) by DeviceID, SensorName
    // | extend Series = AnomalyDetection(list_Timestamp_Value)
    // | mv-expand Series
    // | project DeviceID, SensorName, AnomalousTimestamp = Series.Timestamp, AnomalousValue = Series.Value
    // `,
    // error1: `Syntax Error

    // Expected: }
    // Token: =

    // Line: 12, Position: 99

    // clientRequestId: Kusto.Web.KWE.Query;a60f2e74-cb47-4fb1-9aaa-250927ed457f;337424ab-5643-4665-ac32-cd361c8fba95`,
    // query2: `
    // let deviceIds = dynamic(['cytondevice','emotibit']);
    // Devices
    // | where DeviceID in (deviceIds)
    // | extend RawDataJson = parse_json(RawData)
    // | mv-expand Readings = RawDataJson.SensorReadings
    // | mv-expand Readings
    // | extend SensorName = tostring(bag_keys(Readings)[0])
    // | mv-expand ReadingValues = Readings[SensorName]
    // | extend Value = todouble(ReadingValues.Data), Millis = tolong(ReadingValues.Millis), DeviceTimestamp = tolong(RawDataJson.DeviceData.Timestamp)
    // | extend ActualTimestamp = datetime_add('millisecond', Millis, datetime(1970-01-01) + DeviceTimestamp * 1s)
    // | where isnotempty(Value)
    // | summarize Series=make_series(avg(Value), default=double(null), bin(ActualTimestamp, 1h)) by DeviceID, SensorName
    // | mv-apply Series on
    // (
    //     extend (Timestamp, AvgValue) = Series
    //     | extend (Anomalies, Score, Baseline) = series_decompose_anomalies(AvgValue, 95, 3, 'linefit')
    //     | mv-expand Timestamp to typeof(datetime), AvgValue to typeof(double), Anomalies to typeof(long), Score to typeof(double), Baseline to typeof(double)
    //     | where Anomalies != 0
    //     | project ActualTimestamp=Timestamp, DeviceID, SensorName, AnomalyScore=Score, AnomalyValue=AvgValue, Baseline
    // )`,
    // error2: `Error

    // Unknown function: 'make_series'.

    // clientRequestId: Kusto.Web.KWE.Query;a60f2e74-cb47-4fb1-9aaa-250927ed457f;789cb3d2-670f-4438-a64c-4992ca1ab280`,
    // query3: `
    // let deviceIds = dynamic(['cytondevice','emotibit']);
    // Devices
    // | where DeviceID in (deviceIds)
    // | extend RawDataJson = parse_json(RawData)
    // | mv-expand Readings = RawDataJson.SensorReadings
    // | mv-expand Readings
    // | extend SensorName = tostring(bag_keys(Readings)[0])
    // | mv-expand ReadingValues = Readings[SensorName]
    // | extend Value = todouble(ReadingValues.Data), Millis = tolong(ReadingValues.Millis), DeviceTimestamp = tolong(RawDataJson.DeviceData.Timestamp)
    // | extend ActualTimestamp = datetime_add('millisecond', Millis, datetime(1970-01-01) + DeviceTimestamp * 1s)
    // | where isnotempty(Value)
    // | summarize AvgValue = avg(Value), Count = count() by bin(ActualTimestamp, 1h), DeviceID, SensorName
    // | extend (Anomalies, Score, Baseline) = series_decompose_anomalies(AvgValue, 95, 3, 'linefit')
    // | where Anomalies == 1
    // | project ActualTimestamp, DeviceID, SensorName, AnomalyScore = Score, AnomalyValue = AvgValue, Baseline, Count
    // `,
    // error3: `Error

    // series_decompose_anomalies(): argument #1 must be a dynamic

    // clientRequestId: Kusto.Web.KWE.Query;a60f2e74-cb47-4fb1-9aaa-250927ed457f;806bf8bc-5c87-4c88-97e5-1b64ebd27d17`,
    // query4: `
    // let deviceIds = dynamic(['cytondevice','emotibit']);
    // Devices
    // | where DeviceID in (deviceIds)
    // | extend RawDataJson = parse_json(RawData)
    // | mv-expand Readings = RawDataJson.SensorReadings
    // | mv-expand Readings
    // | extend SensorName = tostring(bag_keys(Readings)[0])
    // | mv-expand ReadingValues = Readings[SensorName]
    // | extend Value = todouble(ReadingValues.Data), Millis = tolong(ReadingValues.Millis), DeviceTimestamp = tolong(RawDataJson.DeviceData.Timestamp)
    // | extend ActualTimestamp = datetime_add('millisecond', Millis, datetime(1970-01-01) + DeviceTimestamp * 1s)
    // | where isnotempty(Value)
    // | make-series AvgValue=avg(Value), Count=count() default=double(null) on ActualTimestamp in range(datetime(1970-01-01), now(), 1h) by DeviceID, SensorName
    // | mv-apply AvgValue on
    // (
    //     extend Anomaly = series_decompose_anomalies(AvgValue)
    //     | mv-expand ActualTimestamp to typeof(datetime), AvgValue to typeof(double), Anomaly to typeof(dynamic)
    //     | extend AnomalyScore = Anomaly['Score'], IsAnomaly = iif(Anomaly['IsAnomaly'] > 0, true, false), ExpectedValue = Anomaly['ExpectedValue']
    //     | where IsAnomaly
    //     | project ActualTimestamp, DeviceID, SensorName, AnomalyValue = AvgValue, AnomalyScore, ExpectedValue
    // )`,
    // error4: `Query Limits Exceeded

    // Query execution has exceeded the allowed limits (80DA0001): Partial query failure: Runaway query (E_RUNAWAY_QUERY). (message: Buffer is getting too large and exceeds the limit of 32GB (see https://aka.ms/kustoquerylimits): ).

    // clientRequestId: Kusto.Web.KWE.Query;a60f2e74-cb47-4fb1-9aaa-250927ed457f;4c56bf11-e97c-48c4-9d4a-0c10b3b2a556`,
    // query5: `
    // let deviceIds = dynamic(['cytondevice','emotibit']);
    // let startTime = ago(30d);
    // let endTime = now();
    // let timeBin = 1h;
    // Devices
    // | where DeviceID in (deviceIds) and EnqueuedTime between (startTime .. endTime)
    // | extend RawDataJson = parse_json(RawData)
    // | mv-expand Readings = RawDataJson.SensorReadings
    // | mv-expand Readings
    // | extend SensorName = tostring(bag_keys(Readings)[0])
    // | mv-expand ReadingValues = Readings[SensorName]
    // | extend Value = todouble(ReadingValues.Data), Millis = tolong(ReadingValues.Millis), DeviceTimestamp = tolong(RawDataJson.DeviceData.Timestamp)
    // | extend ActualTimestamp = datetime_add('millisecond', Millis, datetime(1970-01-01) + DeviceTimestamp * 1s)
    // | where isnotempty(Value) and ActualTimestamp between (startTime .. endTime)
    // | summarize AvgValue = make_list(Value) by bin(ActualTimestamp, timeBin), DeviceID, SensorName
    // | mv-apply AvgValue on
    // (
    //     extend Anomaly = series_decompose_anomalies(AvgValue, 95, 4, 'linefit')
    //     | mv-expand ActualTimestamp to typeof(datetime), AvgValue to typeof(double), Anomaly to typeof(dynamic)
    //     | extend IsAnomaly = iif(Anomaly['IsAnomaly']>0, true, false)
    //     | where IsAnomaly
    //     | project ActualTimestamp, DeviceID, SensorName, AnomalyValue = AvgValue, AnomalyScore = Anomaly['Score'], ExpectedValue = Anomaly['ExpectedValue']
    // )
    // `,
    // error5: `Error

    // Operator mvexpand: expanded expression expected to have dynamic type

    // clientRequestId: Kusto.Web.KWE.Query;a60f2e74-cb47-4fb1-9aaa-250927ed457f;04e5a088-a5f8-4ecf-b7b9-d86a5ca35f1a`,
  });

  console.log("Chain response:");
  // console.log(response.answer);

  for await (const { answer } of response) {
    console.log(answer);
  }
} catch (e) {
  console.error(e);
  Deno.exit(1);
}
