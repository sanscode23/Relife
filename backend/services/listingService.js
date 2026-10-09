const generateListingText = (device, certificate) => {
  const issuesText = device.issues && device.issues.length ? device.issues.join(', ') : 'None';
  const verifyUrl = certificate.verifyUrl || '';

  return `
📱 FOR SALE / TRANSFER: ${device.brand} ${device.model} (${device.purchaseYear})
--------------------------------------------------------
✅ Condition: ${device.condition}
✅ Known Issues: ${issuesText}
✅ Data Safety: Verified & Storage Sanitized
🛡️ RE:LIFE Certificate Verification ID: ${certificate.verificationId}
🔗 Verify Authenticity: ${verifyUrl}

Summary: Pre-owned ${device.deviceType.toLowerCase()} verified on RE:LIFE second-life platform. Data safety checklist completed and hardware verified ready for second life.
--------------------------------------------------------
`.trim();
};

module.exports = {
  generateListingText,
};
