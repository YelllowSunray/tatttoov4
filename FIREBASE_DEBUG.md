# Firebase Permission Debugging

## Current Issue
Getting "Missing or insufficient permissions" when trying to save/read consultation data.

## Steps to Fix

### 1. Deploy Updated Rules to Firebase Console

**CRITICAL**: You must copy the rules from `firestore.rules` to Firebase Console:

1. Go to: https://console.firebase.google.com/project/tatttoo-b78f3/firestore/rules
2. **Copy the ENTIRE content** from `firestore.rules` file
3. **Paste it** into the Firebase Console rules editor
4. Click **"Publish"** button
5. Wait 30-60 seconds for rules to propagate

### 2. Verify Rules Are Deployed

After publishing, the rules should show:
- Allow authenticated users to access their UID-based documents
- Allow create/update/read/delete for documents with `email` field

### 3. Test the Flow

1. Complete a Stripe payment
2. Complete the consultation
3. Check browser console for:
   - "Saving consultation data for email: [email]"
   - "Document created successfully" (should NOT see permission errors)

### 4. If Still Getting Errors

**Temporary Test Rule** (Development Only - NOT for production):

Replace the `user_preferences` section in Firebase Console with:

```javascript
match /user_preferences/{docId} {
  allow read, write: if true;
}
```

This allows ALL operations. Use this ONLY to verify the rules are deploying correctly.

**Then switch back to the secure rules from `firestore.rules`**

### 5. Verify Data Structure

Make sure the document being created has:
- `email` field (string)
- `filterSets` array
- `createdAt` and `updatedAt` timestamps

### 6. Check Firebase Console

1. Go to Firestore Database
2. Look for collection `user_preferences`
3. Check if document with ID `email_iyersamir@gmail.com` exists
4. Verify it has an `email` field

## Common Issues

1. **Rules not deployed**: Most common issue - rules must be published in Firebase Console
2. **Rules syntax error**: Check Firebase Console for syntax errors (red underlines)
3. **Email field missing**: Make sure `addFilterSetByEmail` includes the email field
4. **Document doesn't exist on read**: This is normal - document is created on first write

