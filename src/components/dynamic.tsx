import React from 'react';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core'; // Import DynamicWidget

const WalletButton = () => {
  return (
    <div>
      {/* DynamicWidget will render the wallet connect button */}
      <DynamicWidget />
    </div>
  );
};

export default WalletButton;
