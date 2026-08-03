import socket
import urllib.request
import json

def check_ports():
    ports = [8090, 8091, 8092, 8093, 8094, 8095, 8080, 3000, 5173]
    for port in ports:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.5)
        result = sock.connect_ex(('127.0.0.1', port))
        if result == 0:
            print(f"Port {port} is OPEN!")
            # Try health check
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/health", timeout=1) as resp:
                    print(f"  -> Health check {port}: {resp.status} {resp.read().decode()}")
            except Exception as e:
                print(f"  -> Health check {port} error: {e}")
        sock.close()

if __name__ == '__main__':
    check_ports()
