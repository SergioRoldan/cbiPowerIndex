
//Get proxy from gimmeproxy.com and check this proxy with a request to researchgate
module.exports = function() {
  return {
    getMatches: function(string, regex, index) {
      index || (index = 1); // default to the first capturing group
      var matches = [];
      var match;
      while (match = regex.exec(string)) {
        matches.push(match[index]);
      }

      if(typeof matches === 'undefined') {
        return;
      } else {
        return matches;
      }

    },
    getMatch: function(string, regex, index) {
      index || (index = 1); // default to the first capturing group
      var match;
      match = regex.exec(string);
      //console.log(match);
      if(match == null) {
        return;
      } else {
        //console.log(match);
        return match[index];
      }

    },
    linkRegEx: function() {
      return /(?:<\/a><\/div><div class="name"><a href="https:\/\/www.researchgate.net\/profile\/)(.{1,35})(?:\?_sg)/g;
    },
    itemsRegEx: function() {
      return /(?:<a class="nova-e-link nova-e-link--color-inherit nova-e-link--theme-bare" href="publication\/)(.{1,455})(?:<\/a><\/div><\/div>)/g;
    },
    typeRegEx: function() {
      return /(?:<span class="nova-e-badge nova-e-badge--color-green nova-e-badge--luminosity-high nova-e-badge--size-l nova-e-badge--theme-solid nova-e-badge--radius-m">)(.{1,25})(?:<\/span>)/g;
    },
    nameRegEx: function() {
      return /(?:<div class="header-inner"><img title=")(.{1,25})(?:" alt=")/g;
    },
    institutionRegEx: function() {
      return /(?:<a class="nova-e-link nova-e-link--color-inherit nova-e-link--theme-silent" href="institution\/)(.{1,100})(?:<\/b><\/a>)/g;
    },
    rrcRegEx: function() {
      return /(?:">)(\d*|\d*,\d*)(?:<\/div><div class="nova-e-text nova-e-text--size-m nova-e-text--family-sans-serif nova-e-text--spacing-none nova-e-text--color-inherit")/g;
    },
    rgRegEx: function() {
      return /(?:\/reputation","score":")(\d*.\d*)(?:")/g;
    },
    curresRegEx: function() {
      return /(?:","title":")(.{1,50})(?:","description":")/g;
    },
    skillsRegEx: function() {
      return /(?:"skills":\[)(.{1,5000})(?:]},"templateName":)/g;
    },
    posExpRegEx: function() {
      return  /(?:<\/b><\/div><div class="nova-e-text nova-e-text--size-m nova-e-text--family-sans-serif nova-e-text--spacing-none nova-e-text--color-inherit sub-item-text">)(.{1,155})(?:<\/div><)/g;
    },
    photoRegEx: function() {
      return /(?:" src="https:\/\/i1.rgstatic.net\/ii\/profile.image\/)(.{1,100})(?:"\/><h1>)/g;
    }
  };
};
