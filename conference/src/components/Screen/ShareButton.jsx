import React from 'react';

const ShareButtons = ({ title, content }) => {
  const url = window.location.href;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedContent = encodeURIComponent(content);

  const shareWindow = (shareUrl) => {
    window.open(shareUrl, 'Share', 'width=600,height=400');
  };

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedContent}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedContent}&url=${encodedUrl}`;
  const linkedInShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedContent}`;

  return (
    <div className="flex space-x-2">
      <button onClick={() => shareWindow(facebookShareUrl)}>
        <img src="path/to/facebook-icon.png" alt="Share on Facebook" />
      </button>
      <button onClick={() => shareWindow(twitterShareUrl)}>
        <img src="path/to/twitter-icon.png" alt="Share on Twitter" />
      </button>
      <button onClick={() => shareWindow(linkedInShareUrl)}>
        <img src="path/to/linkedin-icon.png" alt="Share on LinkedIn" />
      </button>
    </div>
  );
};

export default ShareButtons;
