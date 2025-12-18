import urllib.robotparser
from urllib.parse import urlparse

class LegalChecker:
    def __init__(self, user_agent="KiyasGO-AI-Bot/1.0"):
        self.user_agent = user_agent
        self.parsers = {}

    def is_allowed(self, url: str) -> bool:
        """
        Checks if the URL is allowed to be scraped according to robots.txt.
        Caches the parsed robots.txt for domain.
        """
        parsed_url = urlparse(url)
        domain = f"{parsed_url.scheme}://{parsed_url.netloc}"
        
        if domain not in self.parsers:
            rp = urllib.robotparser.RobotFileParser()
            try:
                rp.set_url(domain + "/robots.txt")
                rp.read()
                self.parsers[domain] = rp
            except Exception as e:
                # If robots.txt cannot be read, default to restrictive or permissive?
                # For safety/legal, fail closed or log warning. 
                # Standard practice: if no robots.txt, assume allowed, but if error, be careful.
                print(f"Error reading robots.txt for {domain}: {e}")
                return True # Defaulting to True if file missing, but ideally check status code.

        return self.parsers[domain].can_fetch(self.user_agent, url)

legal_checker = LegalChecker()
