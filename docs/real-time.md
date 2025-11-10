Web APIs reference - API Realtime
The Realtime API is implemented via Server-Sent Events (SSE). Generally, it consists of 2 operations:

establish SSE connection
submit client subscriptions
SSE events are sent for create, update and delete record operations.

You could subscribe to a single record or to an entire collection.

When you subscribe to a single record, the collection's ViewRule will be used to determine whether the subscriber has access to receive the event message.

When you subscribe to an entire collection, the collection's ListRule will be used to determine whether the subscriber has access to receive the event message.

All of this is seamlessly handled by the SDKs using just the subscribe and unsubscribe methods:

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

...

// (Optionally) authenticate
await pb.collection('users').authWithPassword('test@example.com', '1234567890');

// Subscribe to changes in any record in the collection
pb.collection('example').subscribe('_', function (e) {
console.log(e.action);
console.log(e.record);
}, { /_ other options like expand, custom headers, etc. \*/ });

// Subscribe to changes only in the specified record
pb.collection('example').subscribe('RECORD_ID', function (e) {
console.log(e.action);
console.log(e.record);
}, { /_ other options like expand, custom headers, etc. _/ });

// Unsubscribe
pb.collection('example').unsubscribe('RECORD_ID'); // remove all 'RECORD_ID' subscriptions
pb.collection('example').unsubscribe('_'); // remove all '_' topic subscriptions
pb.collection('example').unsubscribe(); // remove all subscriptions in the collection
