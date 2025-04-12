
import React from 'react';
import DyslexiaExtension from '../components/DyslexiaExtension';
import { Helmet } from 'react-helmet';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Read Easy - Dyslexia-Friendly Browser Extension</title>
        <meta name="description" content="A prototype for a dyslexia-friendly browser extension that transforms webpage reading experience." />
      </Helmet>
      <DyslexiaExtension />
    </>
  );
};

export default Index;
