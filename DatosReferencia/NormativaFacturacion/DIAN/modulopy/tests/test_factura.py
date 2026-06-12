import pytest
from pydian.factura import Factura


def test_factura_creation():
      """Test basico de creacion de factura"""
      factura = Factura()
      assert factura is not None


def test_factura_xml_output():
      """Test que la factura genera XML valido"""
      # TODO: implementar test
      pass
