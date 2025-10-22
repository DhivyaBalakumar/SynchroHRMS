import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options


class SynchroHRDemo:
    def __init__(self):
        options = Options()
        options.add_argument("--start-maximized")
        options.add_argument("--disable-notifications")
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
        self.base_url = "https://synchro-hr.vercel.app"

    def pause(self, msg, sec=1.5):
        print(f"⏸️  {msg}")
        time.sleep(sec)

    def sign_up_or_sign_in(self, role, name, email, password):
        self.driver.get(f"{self.base_url}/auth?mode=signup&role={role}")

        try:
            name_field = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[id='fullName']")))
            name_field.clear()
            name_field.send_keys(name)
        except:
            pass
        email_field = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        email_field.clear()
        email_field.send_keys(email)
        password_field = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        password_field.clear()
        password_field.send_keys(password)

        submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_btn.click()
        time.sleep(3)

        if "already registered" in self.driver.page_source.lower():
            # Switch to login
            self.driver.get(f"{self.base_url}/auth?mode=login")
            email_field = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
            email_field.clear()
            email_field.send_keys(email)
            password_field = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
            password_field.clear()
            password_field.send_keys(password)
            submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_btn.click()
            self.wait.until(EC.url_contains('/dashboard'))
            time.sleep(3)

    def explore_dashboard(self, role):
        self.driver.get(f"{self.base_url}/dashboard/{role}")
        self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        self.pause(f"Exploring {role.capitalize()} Dashboard", 2)

        buttons = self.driver.find_elements(By.TAG_NAME, "button")
        links = self.driver.find_elements(By.TAG_NAME, "a")

        # Separate sign out and others
        signouts = []
        others = []
        for elem in buttons + links:
            try:
                txt = elem.text.lower()
                if "sign out" in txt or "logout" in txt:
                    signouts.append(elem)
                # Skip attendance "Sign In" for employee
                elif role == "employee" and elem.tag_name == 'button' and 'sign in' in txt:
                    continue
                else:
                    others.append(elem)
            except:
                others.append(elem)

        for i, elem in enumerate(others, 1):
            try:
                self.driver.execute_script("arguments[0].scrollIntoView(true);", elem)
                elem.click()
                self.pause(f"Clicked element {i}", 1)
            except:
                continue

        for elem in signouts:
            try:
                self.driver.execute_script("arguments[0].scrollIntoView(true);", elem)
                elem.click()
                self.pause("Clicked Sign Out", 2)
            except:
                continue

    def demo(self):
        users = {
            'employee': ('Mike Employee', 'mike.employee@synchro.app', 'Employee2024!'),
            'manager': ('John Manager', 'john.manager@synchro.app', 'Manager2024!'),
            'hr': ('Sarah HR', 'sarah.hr@synchro.app', 'HRManager2024!'),
            'intern': ('Alex Intern', 'alex.intern@synchro.app', 'Intern2024!')
        }
        for role in users:
            name, email, pwd = users[role]
            self.pause(f"Starting flow for {role}", 1)
            self.sign_up_or_sign_in(role, name, email, pwd)
            self.explore_dashboard(role)

        # AI interview demo
        self.driver.get(f"{self.base_url}/demo/ai-interview")
        self.pause("Showing AI Interview demo", 3)

        # Job Portal demo
        self.driver.get(f"{self.base_url}/jobs")
        self.pause("Browsing Job Portal", 3)

        self.cleanup()

    def cleanup(self):
        self.pause("Cleaning up...", 2)
        self.driver.quit()
        print("Demo completed!")


def main():
    demo = SynchroHRDemo()
    demo.demo()


if __name__ == "__main__":
    main()
