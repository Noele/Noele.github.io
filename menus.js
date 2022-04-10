let hamburgerNavigationMenuSwitch = false;
function toggleHamNav() {
    document.getElementById("hamburger-sidenav").style.width = hamburgerNavigationMenuSwitch ? "250px" : "0px";
    hamburgerNavigationMenuSwitch = !hamburgerNavigationMenuSwitch;
}

let helpNavigationMenuSwitch = false;
function toggleHelpNav() {
    document.getElementById("help-sidenav").style.width = helpNavigationMenuSwitch ? "250px" : "0px";
    helpNavigationMenuSwitch = !helpNavigationMenuSwitch;
}
