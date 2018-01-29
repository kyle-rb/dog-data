#Dog Data
This is a simple Amazon Alexa skill that I created, to mark the time when you last fed, walked, let out, or gave medication to your dog.

It's a fairly basic skill that stores the last time the user told Dog Data that they (for example) fed the dog. Then, when asked if someone has fed the dog, Dog Data can tell them how long ago they last did so.

It's helpful for homes where one of several different people may feed the dog, so that the dog is not fed multiple times or not at all.

##Download
You can enable Dog Data through the Alexa skills store [here](https://www.amazon.com/Dog-Data-track-food-walks/dp/B073Q7ND32).

##Forking
Feel free to use this code as a starting point for a similar skill.

It runs on AWS Lambda, and uses a DynamoDB table to store its data. The intents were created using Alexa Skills Kit.

The permissions.json file is necessary for the DynamoDB instance to be accessed. When uploading to Lambda, the index.js file must be zipped along with the node_modules folder.
