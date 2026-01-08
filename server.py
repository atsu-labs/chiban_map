#!/usr/bin/env python3
import http.server
import socketserver
import os
from pathlib import Path

class RangeRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTPの範囲リクエスト(Range header)に対応したハンドラー"""
    
    def do_GET(self):
        """GETリクエストの処理"""
        path = self.translate_path(self.path)
        
        if not os.path.exists(path):
            self.send_error(404, "File not found")
            return
            
        if os.path.isdir(path):
            return super().do_GET()
        
        # ファイルサイズを取得
        file_size = os.path.getsize(path)
        
        # Rangeヘッダーの確認
        range_header = self.headers.get('Range')
        
        if range_header:
            # 範囲リクエストの処理
            try:
                range_match = range_header.replace('bytes=', '').split('-')
                start = int(range_match[0]) if range_match[0] else 0
                end = int(range_match[1]) if len(range_match) > 1 and range_match[1] else file_size - 1
                
                # 範囲の検証
                if start >= file_size or end >= file_size or start > end:
                    self.send_error(416, "Requested Range Not Satisfiable")
                    return
                
                # 206 Partial Content レスポンス
                self.send_response(206)
                self.send_header('Content-Type', self.guess_type(path))
                self.send_header('Content-Length', str(end - start + 1))
                self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                # 指定範囲のファイル内容を送信
                with open(path, 'rb') as f:
                    f.seek(start)
                    bytes_to_read = end - start + 1
                    chunk_size = 8192
                    while bytes_to_read > 0:
                        chunk = f.read(min(chunk_size, bytes_to_read))
                        if not chunk:
                            break
                        self.wfile.write(chunk)
                        bytes_to_read -= len(chunk)
            except Exception as e:
                print(f"Error processing range request: {e}")
                self.send_error(500, str(e))
        else:
            # 通常のリクエストの処理
            self.send_response(200)
            self.send_header('Content-Type', self.guess_type(path))
            self.send_header('Content-Length', str(file_size))
            self.send_header('Accept-Ranges', 'bytes')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            with open(path, 'rb') as f:
                self.wfile.write(f.read())
    
    def end_headers(self):
        # CORSヘッダーを追加
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range')
        super().end_headers()
    
    def do_OPTIONS(self):
        """OPTIONSリクエストの処理（CORS対応）"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range')
        self.end_headers()

if __name__ == '__main__':
    PORT = 8080
    
    with socketserver.TCPServer(("", PORT), RangeRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}/")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
