export function manualTranslate(name) {
    const dict = {
       
    };
    return dict[name.toLowerCase()] || name.charAt(0).toUpperCase() + name.slice(1);
}

export function reverseTranslate(rusName) {
    const dict = {
        
    }
    return dict[rusName.toLowerCase()] || rusName.toLowerCase();
}

export function translateAbility(ability) {
    const dict = {
       
    }
    return dict[ability.toLowerCase()] || ability.charAt(0).toUpperCase() + ability.slice(1);
}

export function abilityDescriptionTranslate(ability) {
    const dict = {
      
    }
    return dict[ability.toLowerCase()] || "";
}