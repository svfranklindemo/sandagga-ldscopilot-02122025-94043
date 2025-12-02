import { showLoader, hideLoader, showPopup } from './ui-utils.js';

const urlParams = new URLSearchParams(window.location.search);
const shouldLoadCopilot = urlParams.has('copilot-prod');
let demoPilotDomain = 'https://demo-system-zoltar-demo-pilot-deploy-ethos101-stag-6229b6.stage.cloud.adobe.io';
if (shouldLoadCopilot) {
    demoPilotDomain = urlParams.get('copilot-prod') === '1' 
            ? 'https://demo-system-zoltar-demo-pilot-deploy-ethos101-prod-23e40d.cloud.adobe.io' 
            : 'https://demo-system-zoltar-demo-pilot-deploy-ethos101-stag-6229b6.stage.cloud.adobe.io';
}

let aemURL = 'https://author-p121371-e1189853.adobeaemcloud.com/';
if (shouldLoadCopilot) {
    aemURL = urlParams.get('copilot-prod') === '1' ? 'https://author-p165802-e1765367.adobeaemcloud.com/' : 'https://author-p121371-e1189853.adobeaemcloud.com/';
}
// Function to get the authentication token
const getAuthToken = () => {
    return window.location.search.split('ims_token=')[1];
};

// Function to get user LDAP (now returns email from IMS profile)
const getUserLdap = async () => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Authentication token not found');
        }
        const response = await fetch(`${demoPilotDomain}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const profile = await response.json();
        return profile.email.split('@')[0];
    } catch (error) {
        console.error('Error fetching profile email:', error);
        return null;
    }
};

// Function to extract project and demo IDs from URL parameter
const extractIds = (paramValue) => {
    if (!paramValue) return null;
    const parts = paramValue.split('/');
    if (parts.length >= 2) {
        return {
            projectId: parts[0],
            demoId: parts[1]
        };
    }
    return null;
};

// Function to fetch project data from API
const fetchProjectData = async (projectId) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await fetch(`${demoPilotDomain}/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching project data:', error);
        throw error;
    }
};

// Function to get resource type from component name
const getResourceType = (pathToModify) => {
    try {
        if (!pathToModify) {
            console.warn('No pathToModify provided');
            return null;
        }

        // Split the pathToModify by '_' and validate parts
        const parts = pathToModify.split('_');
        if (parts.length < 2) {
            console.warn('Invalid pathToModify format');
            return null;
        }

        const componentName = parts[0];
        const childComponentName = parts.length > 2 ? parts[2] : null;
        
        // Component filters data - standardize as arrays
        const filterData = {
            "column": ["text", "image", "button", "title"],
            "activity-details": ["activity-detail"],
            "accordion": ["accordion-item"],
            "carousel": ["slide"],
            "section": ["image","text","title","button"],
            "header": ["image","text","title","button"],
            "footer": ["image","text","title","button"]
        };

        // Component definition data with their resource types
        const componentData = {
            "text": "core/franklin/components/text/v1/text",
            "title": "core/franklin/components/title/v1/title",
            "image": "core/franklin/components/image/v1/image",
            "button": "core/franklin/components/button/v1/button",
            "section": "core/franklin/components/section/v1/section",
            "columns": "core/franklin/components/columns/v1/columns",
            "hero": "core/franklin/components/block/v1/block",
            "carousel": "core/franklin/components/block/v1/block",
            "slide": "core/franklin/components/block/v1/block/item",
            "accordion": "core/franklin/components/block/v1/block",
            "accordion-item": "core/franklin/components/block/v1/block/item",
            "teaser": "core/franklin/components/block/v1/block",
            "featured-article": "core/franklin/components/block/v1/block",
            "content-fragment": "core/franklin/components/block/v1/block",
            "article-content-fragment": "core/franklin/components/block/v1/block",
            "demo-block": "core/franklin/components/block/v1/block",
            "workfront-reference": "core/franklin/components/block/v1/block",
            "embed": "core/franklin/components/block/v1/block",
            "blockquote": "core/franklin/components/block/v1/block",
            "article-details": "core/franklin/components/block/v1/block",
            "activity-detail": "core/franklin/components/block/v1/block/item"
        };

        // Get the base resource type for the component
        let resourceType = componentData[componentName];
        if (!resourceType) {
            console.warn(`No resource type found for component: ${componentName}`);
            return null;
        }

        // Initialize filter and finalComponentName
        let filter = null;
        let finalComponentName = componentName;

        // Special handling for columns
        if (componentName === 'columns' && childComponentName) {
            // For columns, check if child component is valid
            if (filterData.column.includes(childComponentName)) {
                filter = 'columns';
                finalComponentName = childComponentName;
                resourceType = componentData[childComponentName];
            }
        } else if (filterData[componentName] && componentName !== 'columns') {
            // For other filter containers, get the filter component name from array
            const filterComponentName = filterData[componentName][0]; // Get the first (and only) element
            filter = componentName;
            finalComponentName = filterComponentName;
            resourceType = componentData[filterComponentName];
        }

        return {
            resourceType,
            filter,
            model: finalComponentName,
            childComponent: childComponentName
        };

    } catch (error) {
        console.error('Error in getResourceType:', error);
        return null;
    }
};

// Function to find path to modify based on edit ID
const getPathToModify = (editId) => {
    try {
        // Find element with matching data-demo-copilot-edit-id
        const element = document.querySelector(`[data-demo-copilot-edit-id="${editId}"]`);
        if (!element) {
            console.warn(`No element found with data-demo-copilot-edit-id="${editId}"`);
            return null;
        }
        
        // Return the ID of the element
        return element.id || null;
    } catch (error) {
        console.error('Error finding path to modify:', error);
        return null;
    }
};

// Function to process edits and create payload updates
const processEdits = (demo) => {
    if (!demo || !demo.edits) return null;
  
    return demo.edits.map((edit) => {
        let pathToModify = getPathToModify(edit.id);

        const resource = getResourceType(pathToModify);
        let componentSection = "";
        if (edit.targetInfo.xPath && edit.targetInfo.xPath.includes("header")) {
          componentSection = "header";
          pathToModify = "nav_image";
        } else if(edit.targetInfo.xPath && edit.targetInfo.xPath.includes("footer")){
          componentSection = "footer";
          pathToModify = "footer_image";
        } else {
          componentSection = "section";
        }
      return {
        importedUrl: edit.sourceUrl || "",
        pathToModify: pathToModify || edit.targetInfo.xPath || "",
        name: edit.sourceImageId || "",
        originalEdit: edit,
        editId: edit.id,
        resource: resource,
        componentSection: componentSection
      };
    });
  };

// Function to get payload updates
const getPayloadUpdates = async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const copilotParam = urlParams.get('copilotEditor') || urlParams.get('copilotPreview');
        const ids = extractIds(copilotParam);
        
        if (!ids) {
            console.error('Invalid project/demo IDs in URL');
            return null;
        }

        const projectData = await fetchProjectData(ids.projectId);
        
        // Find the specific demo in the project data
        const targetDemo = projectData.demos.find(demo => demo.id === ids.demoId);
        
        if (!targetDemo) {
            console.error('Demo not found in project data');
            return null;
        }

        const updates = processEdits(targetDemo);
        
        if (!updates) {
            console.error('No valid updates found in demo data');
            return null;
        }

        const userLdap = await getUserLdap();
        if (!userLdap) {
            console.error('Could not retrieve user LDAP');
            return null;
        }

        const pagePathVar = window.location.pathname.endsWith('/') ? '/index' : window.location.pathname;

        return {
            projectName: targetDemo.name,
            type: "wknd",
            userLdap: userLdap,
            aemURL: aemURL,
            images: updates,
            demoId: targetDemo.id,
            pagePath: "/content/"+userLdap+"/"+targetDemo.id+"/us/en"+pagePathVar,
            projectId: ids.projectId
        };
    } catch (error) {
        console.error('Error getting payload updates:', error);
        return null;
    }
};

// Function to check if AEM instance is valid and running
const checkAEMInstance = async () => {
    try {
        // Use HEAD request to just check if the image exists and instance is up
        const response = await fetch('https://publish-p121371-e1189853.adobeaemcloud.com/content/dam/aem-demo-assets/en/activities/skiing/skitouring.jpg', {
            method: 'HEAD',
        });
        return response.ok && response.status === 200;
    } catch (error) {
        console.error('Error checking AEM instance:', error);
        return false;
    }
};

export async function uploadAsset() {
    let updates;
    try {
        showLoader();
        
        //check if AEM instance is valid and running or not 
        /*const aemInstance = await checkAEMInstance();
        if (!aemInstance) {
            hideLoader();
            showPopup('AEM instance is not running. Please check the AEM instance. or reach out to LPB team', 'notice');
            return { status: 'error', message: 'AEM instance is not valid or running' };
        }*/

        // Check for token before proceeding
        const token = getAuthToken();
        if (!token) {
            hideLoader();
            showPopup('Authentication token not found. Please log in again.', 'notice');
            return { status: 'error', message: 'Authentication token not found' };
        }

        // Get updates from API
        updates = await getPayloadUpdates();
        
        // Return early if no updates are available
        if (!updates) {
            hideLoader();
            showPopup('No updates available for asset upload', 'notice');
            return { status: 'skipped', message: 'No updates available' };
        }

        console.log("payload for assets:", updates);

        const prod_url = "https://275323-918sangriatortoise.adobeio-static.net/api/v1/web/dx-excshell-1/updateXwalkSite";
        const stage_url = "https://275323-918sangriatortoise-stage.adobeio-static.net/api/v1/web/dx-excshell-1/assets";
        // Send request in no-cors mode
        const response = await fetch(prod_url, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });

        let content = await response.text()
        console.log('content from upload:', content);

        const targetUrl = window.location.origin+window.location.pathname;
        
        

        hideLoader();
        showPopup(`Uploaded successfully<br><br><strong>Demo URL:</strong><br><a href="${targetUrl}" target="_blank">${targetUrl}</a>`, 'success', false);
        return { status: 'sent', message: 'Request sent in no-cors mode' };

    } catch (error) {
        console.error('Upload failed:', error);
        hideLoader();
        showPopup('Failed to upload assets. Please try again.', 'notice');
        throw error;
    }
}