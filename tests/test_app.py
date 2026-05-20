import unittest

from app import app


class AppRoutesTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health_endpoint(self):
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {'status': 'ok'})

    def test_landing_page_is_served(self):
        response = self.client.get('/')
        try:
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'<html', response.data.lower())
        finally:
            response.close()

    def test_app_page_is_served(self):
        response = self.client.get('/app')
        try:
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'backend', response.data.lower())
        finally:
            response.close()

    def test_extension_workspace_is_served(self):
        response = self.client.get('/extension')
        try:
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'min-conflit solver workspace', response.data.lower())
            self.assertIn(b'<base href="/extension/">', response.data.lower())
        finally:
            response.close()

    def test_extension_popup_is_served(self):
        response = self.client.get('/extension-popup')
        try:
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'chrome extension', response.data.lower())
            self.assertIn(b'<base href="/extension/">', response.data.lower())
        finally:
            response.close()

    def test_extension_case_study_is_served(self):
        response = self.client.get('/extension-showcase')
        try:
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'case study', response.data.lower())
        finally:
            response.close()

    def test_extension_privacy_page_is_served(self):
        response = self.client.get('/extension-privacy')
        try:
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'privacy policy', response.data.lower())
        finally:
            response.close()

    def test_extension_solver_script_is_served(self):
        response = self.client.get('/extension/lib/solvers.js')
        try:
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'minconflitsolvers', response.data.lower())
        finally:
            response.close()


if __name__ == '__main__':
    unittest.main()
