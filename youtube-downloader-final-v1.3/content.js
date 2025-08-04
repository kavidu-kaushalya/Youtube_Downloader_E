function addDownloadButton() {
  // Check if button already exists
  if (document.getElementById("yt-download-btn")) return;

  // Wait for document.body to be available
  if (!document.body) {
    console.log("⏳ Waiting for document.body...");
    setTimeout(addDownloadButton, 100);
    return;
  }

  const videoId = new URLSearchParams(window.location.search).get("v");
  if (!videoId) {
    console.log("No video ID found");
    return;
  }

  console.log(`📹 Adding download button for video: ${videoId}`);

  // 🔘 Create button
  const btn = document.createElement("button");
  btn.id = "yt-download-btn";

  const icon = document.createElement("img");
  icon.src = chrome.runtime.getURL("downloadi.png");
  icon.style.cssText = `
    width: 15px;
    height: 15px;
    margin-right: 8px;
    margin-left: 10px;
  `;

  btn.appendChild(icon);
  btn.appendChild(document.createTextNode("Download"));

  btn.style.cssText = `
    position: fixed;
    top: 10px;
    right: 250px;
    background-color: #272727;
    color: #fff;
    border: none;
    border-radius: 18px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Roboto', sans-serif;
    display: inline-flex;
    align-items: center;
    height: 36px;
    min-width: 118px;
    z-index: 9999;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  `;

  btn.onmouseenter = () => btn.style.backgroundColor = "#353535ff";
  btn.onmouseleave = () => btn.style.backgroundColor = "#272727";

  btn.onclick = async () => {
    // Create quality selection popup
    const popup = document.createElement("div");
    popup.id = "yt-quality-popup";
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #161616ff;
      padding: 20px;
      border-radius: 12px;
      z-index: 10000;
      color: white;
      font-family: 'Roboto', sans-serif;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      width: 500px;
    `;

  // Add an image (Youtube.png) at the top of the popup
  const ytImg = document.createElement("img");
  ytImg.src = chrome.runtime.getURL("youtube.png");
  ytImg.alt = "YouTube";
  ytImg.style.cssText = `
    display: block;
    margin: 10px auto 30px auto;
    width: 120px;
    height: auto;

  `;
  popup.appendChild(ytImg);

    // Add title
    const title = document.createElement("h3");
    title.textContent = "Select Quality";
    title.style.cssText = `
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 16px;
      font-family: 'Roboto', sans-serif;
      text-align: center;
    `;
    popup.appendChild(title);

    // Add loading message
    const loadingMsg = document.createElement("div");
    loadingMsg.textContent = "Loading video information...";
    loadingMsg.style.cssText = `
      text-align: center;
      color: #aaa;
      font-family: 'Roboto', "Arial", sans-serif;
      font-size: 15px;
      margin: 20px 0;
    `;
    popup.appendChild(loadingMsg);

    // Add overlay first
    const overlay = document.createElement("div");
    overlay.id = "yt-quality-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
    `;
    overlay.onclick = () => {
      popup.remove();
      overlay.remove();
    };

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    try {
      // Fetch video information
      console.log(`Fetching video info for ID: ${videoId}`);
      console.log(`Using server URL: ${SERVER_CONFIG.serverUrl}`);
      
      const response = await fetch(`${SERVER_CONFIG.serverUrl}/video-info?videoId=${videoId}`);
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response ok: ${response.ok}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const videoInfo = await response.json();
      console.log('Video info response:', videoInfo);
      console.log('Video info qualities:', videoInfo.qualities);

      if (videoInfo.error) {
        throw new Error(videoInfo.error);
      }

      // Ensure qualities object exists
      if (!videoInfo.qualities) {
        console.log("No qualities in response, creating fallback");
        videoInfo.qualities = {};
      }

      // Remove loading message
      loadingMsg.remove();

      // Add video title if available
      if (videoInfo.title) {
        const videoTitle = document.createElement("div");
        videoTitle.textContent = videoInfo.title.length > 50 ? 
          videoInfo.title.substring(0, 50) + "..." : videoInfo.title;
        videoTitle.style.cssText = `
          font-size: 14px;
          color: #ccc;
          margin-bottom: 15px;
          text-align: center;
          line-height: 1.3;
        `;
        popup.appendChild(videoTitle);
      }

      const hr = document.createElement("hr");
      hr.style.cssText = `
        border: none;
        border-top: 1px solid #333;
        margin: 18px 0 12px 0;
        width: 100%;
        background: transparent;
      `;
      popup.appendChild(hr);

      // Create quality options with sizes
      const qualities = ["360p", "480p", "720p", "1080p"];
      let selectedQuality = "720p"; // Default selection

      // Fallback size estimates (in MB per minute)
      const fallbackSizes = {
        "360p": 5,
        "480p": 8, 
        "720p": 15,
        "1080p": 25
      };

      qualities.forEach(quality => {
        const container = document.createElement("div");
        container.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
          border: 1px solid transparent;
        `;
        container.onmouseenter = () => container.style.backgroundColor = "#3d3d3d";
        container.onmouseleave = () => container.style.backgroundColor = "transparent";

        const leftSide = document.createElement("div");
        leftSide.style.cssText = `
          display: flex;
          align-items: center;
          flex-grow: 1;
        `;

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "quality";
        radio.value = quality;
        radio.id = `quality-${quality}`;
        radio.style.cssText = `
          margin-right: 12px;
          accent-color: #3ea6ff;
          width: 16px;
          height: 16px;
          cursor: pointer;
        `;
        radio.checked = quality === selectedQuality;
        
        radio.addEventListener("change", () => {
          selectedQuality = quality;
          // Update visual selection
          qualities.forEach(q => {
            const cont = document.getElementById(`quality-${q}`).parentElement.parentElement;
            cont.style.borderColor = q === quality ? "#3ea6ff" : "transparent";
          });
        });

        const label = document.createElement("label");
        label.htmlFor = `quality-${quality}`;
        label.textContent = quality;
        label.style.cssText = `
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
        `;

        leftSide.appendChild(radio);
        leftSide.appendChild(label);

        const sizeInfo = document.createElement("div");
        const qualityData = videoInfo.qualities[quality];
        console.log(`Quality ${quality} data:`, qualityData);
        
        if (qualityData && qualityData.size_formatted) {
          const sizeText = qualityData.estimated ? 
            `~${qualityData.size_formatted}` : qualityData.size_formatted;
          sizeInfo.textContent = sizeText;
          sizeInfo.style.cssText = `
            color: #aaa;
            font-size: 12px;
            margin-left: 10px;
          `;
        } else {
          sizeInfo.textContent = "Size unavailable";
          sizeInfo.style.cssText = `
            color: #666;
            font-size: 12px;
            margin-left: 10px;
          `;
          console.log(`No size data available for ${quality}:`, qualityData);
        }

        container.appendChild(leftSide);
        container.appendChild(sizeInfo);
        popup.appendChild(container);

        // Set initial selection border
        if (quality === selectedQuality) {
          container.style.borderColor = "#3ea6ff";
        }
      });


      // Add close button
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Cancel";
      closeBtn.style.cssText = `
        width: 110px;
        padding: 10px;
        align: right;
        right: 10px;
        margin-top: 10px;
        background-color: transparent;
        color: #aaa;
        border: none;
        border-radius: 30px;
        font-weight: 500;
        font-family: 'Roboto', "Arial", sans-serif;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.2s;
      `;
      closeBtn.onmouseenter = () => closeBtn.style.backgroundColor = "#3d3d3d";
      closeBtn.onmouseleave = () => closeBtn.style.backgroundColor = "transparent";

      closeBtn.onclick = () => {
        popup.remove();
        overlay.remove();
      };

      popup.appendChild(closeBtn);

          // Add download button in popup
      const downloadBtn = document.createElement("button");
      downloadBtn.textContent = "Download";
      downloadBtn.style.cssText = `
        width: 110px;
        padding: 10px;
        align-self: right;
        right: 10px;
        margin-top: 10px;
        background-color: transparent;
        color: #3ea6ff ;
        border: none;
        border-radius: 30px;
        font-weight: 500;
        font-size: 14px;
        font-family: 'Roboto', "Arial", sans-serif;
        cursor: pointer;
        transition: background-color 0.2s;
      `;
      downloadBtn.onmouseenter = () => downloadBtn.style.backgroundColor = "rgba(62, 166, 255, 0.15)";
      downloadBtn.onmouseleave = () => downloadBtn.style.backgroundColor = "transparent";

      downloadBtn.onclick = async () => {
        try {
          // Show downloading status
          downloadBtn.textContent = "Downloading...";
          downloadBtn.disabled = true;
          downloadBtn.style.opacity = "0.7";
          
          console.log(`Starting download: ${SERVER_CONFIG.serverUrl}/download?videoId=${videoId}&quality=${selectedQuality}`);
          
          // Create a hidden link element to trigger download
          const link = document.createElement('a');
          link.href = `${SERVER_CONFIG.serverUrl}/download?videoId=${videoId}&quality=${selectedQuality}`;
          link.download = ''; // This suggests to browser to download instead of navigate
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          console.log("Download link clicked");
          
          // Reset button after a short delay
          setTimeout(() => {
            downloadBtn.textContent = "Download";
            downloadBtn.disabled = false;
            downloadBtn.style.opacity = "1";
          }, 3000); // Increased delay for rate limiting
          
          // Keep popup open for 3 seconds to show download status
          setTimeout(() => {
            popup.remove();
            overlay.remove();
          }, 3000);
          
        } catch (error) {
          console.error('Download failed:', error);
          downloadBtn.textContent = "Download Failed";
          downloadBtn.style.color = "#ff4444";
          
          setTimeout(() => {
            downloadBtn.textContent = "Download";
            downloadBtn.style.color = "#3ea6ff";
            downloadBtn.disabled = false;
            downloadBtn.style.opacity = "1";
          }, 5000); // Longer delay for error recovery
        }
      };

      popup.appendChild(downloadBtn);


    } catch (error) {
      console.error("Failed to fetch video info:", error);
      console.error("Error details:", {
        message: error.message,
        videoId: videoId,
        fetchUrl: `${SERVER_CONFIG.serverUrl}/video-info?videoId=${videoId}`
      });
      
      // Remove loading message and show error
      loadingMsg.textContent = `Failed to load video information (${error.message}). You can still download with default options.`;
      loadingMsg.style.color = "#005ecaff";

      // Add basic quality options without sizes
      const qualities = ["360p", "480p", "720p", "1080p"];
      let selectedQuality = "720p";

      qualities.forEach(quality => {
        const container = document.createElement("div");
        container.style.cssText = `
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        `;
        container.onmouseenter = () => container.style.backgroundColor = "#3d3d3d";
        container.onmouseleave = () => container.style.backgroundColor = "transparent";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "quality";
        radio.value = quality;
        radio.id = `quality-${quality}`;
        radio.style.cssText = `
          margin-right: 10px;
          accent-color: #3ea6ff;
          width: 16px;
          height: 16px;
          cursor: pointer;
        `;
        radio.checked = quality === selectedQuality;
        
        radio.addEventListener("change", () => {
          selectedQuality = quality;
        });

        const label = document.createElement("label");
        label.htmlFor = `quality-${quality}`;
        label.textContent = quality;
        label.style.cssText = `
          cursor: pointer;
          flex-grow: 1;
          font-size: 16px;
        `;

        container.appendChild(radio);
        container.appendChild(label);
        popup.appendChild(container);
      });

      // Add download button in popup
      const downloadBtn = document.createElement("button");
      downloadBtn.textContent = "Download";
      downloadBtn.style.cssText = `
        width: 100%;
        padding: 10px;
        margin-top: 10px;
        background-color: #3ea6ff;
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      `;
      downloadBtn.onmouseenter = () => downloadBtn.style.backgroundColor = "#65b5ff";
      downloadBtn.onmouseleave = () => downloadBtn.style.backgroundColor = "#3ea6ff";

      downloadBtn.onclick = async () => {
        try {
          // Show downloading status
          downloadBtn.textContent = "Downloading...";
          downloadBtn.disabled = true;
          downloadBtn.style.opacity = "0.7";
          
          // Create a hidden link element to trigger download
          const link = document.createElement('a');
          link.href = `${SERVER_CONFIG.serverUrl}/download?videoId=${videoId}&quality=${selectedQuality}`;
          link.download = ''; // This suggests to browser to download instead of navigate
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Reset button after a short delay
          setTimeout(() => {
            downloadBtn.textContent = "Download";
            downloadBtn.disabled = false;
            downloadBtn.style.opacity = "1";
          }, 2000);
          
          // Keep popup open for 2 seconds to show download status
          setTimeout(() => {
            popup.remove();
            overlay.remove();
          }, 2000);
          
        } catch (error) {
          console.error('Download failed:', error);
          downloadBtn.textContent = "Download Failed";
          downloadBtn.style.backgroundColor = "#ff4444";
          
          setTimeout(() => {
            downloadBtn.textContent = "Download";
            downloadBtn.style.backgroundColor = "#3ea6ff";
            downloadBtn.disabled = false;
            downloadBtn.style.opacity = "1";
          }, 3000);
        }
      };

      popup.appendChild(downloadBtn);

      // Add close button
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Cancel";
      closeBtn.style.cssText = `
        width: 100%;
        padding: 10px;
        margin-top: 8px;
        background-color: transparent;
        color: #aaa;
        border: none;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      `;
      closeBtn.onmouseenter = () => closeBtn.style.backgroundColor = "#3d3d3d";
      closeBtn.onmouseleave = () => closeBtn.style.backgroundColor = "transparent";

      closeBtn.onclick = () => {
        popup.remove();
        overlay.remove();
      };

      popup.appendChild(closeBtn);
    }
  };

  try {
    document.body.appendChild(btn);
    console.log("✅ Download button added");
  } catch (error) {
    console.error("❌ Failed to add download button:", error);
  }
}

// Auto-check every 1 second for YouTube video links
let autoCheckInterval;
let lastUrl = '';

function startAutoCheck() {
  // Clear existing interval if any
  if (autoCheckInterval) {
    clearInterval(autoCheckInterval);
  }
  
  // Set up 1-second interval check
  autoCheckInterval = setInterval(() => {
    const currentUrl = window.location.href;
    
    // Check if we're on a YouTube video page
    if (currentUrl.includes("watch?v=")) {
      const existingBtn = document.getElementById("yt-download-btn");
      
      // Add button if URL changed, button doesn't exist, or if we're on a new video
      if (currentUrl !== lastUrl || !existingBtn) {
        console.log("🔁 YouTube video detected, trying to add button");
        console.log(`Current URL: ${currentUrl}`);
        console.log(`Last URL: ${lastUrl}`);
        console.log(`Button exists: ${!!existingBtn}`);
        
        addDownloadButton();
        lastUrl = currentUrl;
      }
    } else {
      // Remove button if we're not on a video page
      const existingBtn = document.getElementById("yt-download-btn");
      if (existingBtn) {
        console.log("🗑️ Removing button - not on video page");
        existingBtn.remove();
      }
      lastUrl = '';
    }
  }, 1000); // 1-second interval
}

// MutationObserver to detect dynamic changes (backup method)
function setupMutationObserver() {
  if (!document.body) {
    // Wait for body to be available
    setTimeout(setupMutationObserver, 100);
    return;
  }
  
  const observer = new MutationObserver(() => {
    if (window.location.href.includes("watch?v=")) {
      console.log("🔁 Page mutation detected, trying to add button");
      addDownloadButton();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  console.log("✅ MutationObserver setup complete");
}

// Setup observer when ready
setupMutationObserver();

// Override history methods to catch YouTube's navigation
(function() {
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function() {
    originalPushState.apply(history, arguments);
    console.log("🔄 History pushState detected");
    setTimeout(() => {
      if (window.location.href.includes("watch?v=")) {
        console.log("🎯 Video page detected via pushState");
        addDownloadButton();
      }
    }, 100);
  };
  
  history.replaceState = function() {
    originalReplaceState.apply(history, arguments);
    console.log("🔄 History replaceState detected");
    setTimeout(() => {
      if (window.location.href.includes("watch?v=")) {
        console.log("🎯 Video page detected via replaceState");
        addDownloadButton();
      }
    }, 100);
  };
  
  // Also listen for popstate events
  window.addEventListener('popstate', () => {
    console.log("🔄 Popstate event detected");
    setTimeout(() => {
      if (window.location.href.includes("watch?v=")) {
        console.log("🎯 Video page detected via popstate");
        addDownloadButton();
      }
    }, 100);
  });
})();

// Start the auto-check system
startAutoCheck();

// Initial try with multiple attempts for first load
function initialLoad() {
  console.log("🚀 Initial load function called");
  console.log(`Current URL: ${window.location.href}`);
  console.log(`Document ready state: ${document.readyState}`);
  
  if (window.location.href.includes("watch?v=")) {
    console.log("🚀 Initial page load detected - YouTube video");
    
    // Try immediately
    addDownloadButton();
    
    // Try multiple times with increasing delays to catch different loading states
    const attempts = [100, 300, 500, 800, 1000, 1500, 2000, 3000];
    attempts.forEach((delay, index) => {
      setTimeout(() => {
        console.log(`🔄 Attempt ${index + 2} to add button after ${delay}ms`);
        addDownloadButton();
      }, delay);
    });
  } else {
    console.log("📄 Not a YouTube video page");
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  console.log("📋 Document still loading, waiting for DOMContentLoaded");
  document.addEventListener('DOMContentLoaded', initialLoad);
} else {
  console.log("📋 Document already loaded");
  // DOM is already loaded
  initialLoad();
}

// Also try when window is fully loaded
window.addEventListener('load', () => {
  console.log("🪟 Window fully loaded");
  initialLoad();
});

// Additional check for YouTube-specific elements
function waitForYouTubeElements() {
  if (!window.location.href.includes("watch?v=")) return;
  
  const checkForElements = () => {
    // Check if key YouTube elements are present
    const videoPlayer = document.querySelector('#movie_player, .html5-video-player');
    const videoTitle = document.querySelector('#title h1, .title');
    
    if (videoPlayer || videoTitle) {
      console.log("🎬 YouTube video elements detected");
      addDownloadButton();
    } else {
      console.log("⏳ Waiting for YouTube elements...");
      setTimeout(checkForElements, 500);
    }
  };
  
  checkForElements();
}

// Start checking for YouTube elements
setTimeout(waitForYouTubeElements, 1000);
