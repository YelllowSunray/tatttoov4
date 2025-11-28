# Firestore Rules Update - Email-Based User Preferences

## Quick Fix

1. **Go to Firebase Console:**
   - Navigate to [Firebase Console - Firestore Rules](https://console.firebase.google.com/project/tatttoo-b78f3/firestore/rules)

2. **Copy the rules from `firestore.rules` file** and paste them into the Firebase Console

3. **Click "Publish"**

4. **Wait 30-60 seconds** for the rules to propagate

## What the Rules Do

The updated rules allow:

1. **Authenticated users**: Can read/write their own preferences using their Firebase Auth UID
2. **Email-based documents**: Can be created/updated/read by anyone if they contain an `email` field
   - Document IDs are in format: `email_actual@email.com`
   - The `email` field in the document data identifies it as an email-based document

## Testing

After deploying the rules:

1. Complete a Stripe payment
2. Complete the consultation
3. The data should save to Firebase without permission errors

## Troubleshooting

If you still get "Missing or insufficient permissions":

1. **Verify rules are deployed**: Check Firebase Console to ensure the rules were published
2. **Check the email field**: Make sure the document being created has an `email` field in the data
3. **Wait for propagation**: Rules can take up to 60 seconds to propagate
4. **Hard refresh**: Clear browser cache and hard refresh (Ctrl+Shift+R)

## Temporary Test Mode (Development Only)

If you need to test quickly, you can temporarily use these rules (⚠️ NOT for production):

```javascript
match /user_preferences/{docId} {
  allow read, write: if true;
}
```

This allows all operations on user_preferences. **Only use this for testing!**

