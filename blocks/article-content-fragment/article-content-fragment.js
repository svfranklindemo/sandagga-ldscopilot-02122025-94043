// put your AEM publish address here
//const AEM_HOST = "https://publish-p131639-e1282833.adobeaemcloud.com";
// this fixes having to manually change the AEM host here
const AEM_HOST = checkDomain()

function checkDomain(){
  if (window.location.hostname.includes("hlx.page") || window.location.hostname.includes("localhost")){
    return "https://publish-p131639-e1282833.adobeaemcloud.com/"    
  }else{
    return window.location.origin 
  }
}

export default function decorate(block) {

  const slugDiv = block.querySelector('div:nth-child(1)'); 
  const slugID = document.createElement('div');
  slugID.id = 'slug';
  slugDiv.replaceWith(slugID);
  slugID.innerHTML = `${slugDiv.innerHTML}`;
  const slug = slugID.textContent.trim();
  
  const quoteDiv = block.querySelector('div:last-of-type');
  const articleDiv = document.createElement('div');
  articleDiv.id = "article-" + slug; 
  quoteDiv.replaceWith(articleDiv);

fetch(AEM_HOST + '/graphql/execute.json/aem-demo-assets/article-by-slug;slug=' + slug)
.then(response => response.json())
.then(response => {

const articleTitle = response.data.articleList.items[0].title;
document.getElementById(articleDiv.id).innerHTML += "<section><h3>"+ articleTitle + "</h3></section>";

const articleAuthorFirst = response.data.articleList.items[0].authorFragment.firstName;
const articleAuthorLast = response.data.articleList.items[0].authorFragment.lastName;
document.getElementById(articleDiv.id).innerHTML += "<section><h4> By "+ articleAuthorFirst + " " + articleAuthorLast + "</h4></section>";

for (var i=0; i<response.data.articleList.items[0].main.json.length; i++) { 
  document.getElementById(articleDiv.id).innerHTML += "<section><p>" + response.data.articleList.items[0].main.json[i].content[0].value;  + "</p></section>";
}

const articleImage = response.data.articleList.items[0].featuredImage._path;
document.getElementById(articleDiv.id).innerHTML += "<img src=" + AEM_HOST + articleImage + ">";


})
.catch(error => {
  console.log('Error fetching data:', error);
});

}





