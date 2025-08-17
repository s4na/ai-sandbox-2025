const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('架空の画像トリミングツール', () => {
  test.beforeEach(async ({ page }) => {
    // ローカルファイルを直接開く
    await page.goto(`file://${path.resolve(__dirname, '../15/index.html')}`);
  });

  test('ページが正しく表示される', async ({ page }) => {
    // タイトルが表示される
    await expect(page.locator('h1')).toContainText('架空の画像トリミングツール');
    
    // ドロップゾーンが表示される
    const dropZone = page.locator('#dropZone');
    await expect(dropZone).toBeVisible();
    await expect(dropZone).toContainText('画像をドラッグ&ドロップ');
  });

  test('画像をアップロードできる', async ({ page }) => {
    // テスト用の画像を作成
    const canvas = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 100, 100);
      return canvas.toDataURL('image/png');
    });
    
    // base64をBlobに変換してファイルとして扱う
    await page.evaluate((dataUrl) => {
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], {type: mime});
      const file = new File([blob], 'test.png', {type: mime});
      
      // FileListを模擬
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      // ファイル入力に設定
      const fileInput = document.getElementById('fileInput');
      fileInput.files = dataTransfer.files;
      
      // changeイベントを発火
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    }, canvas);
    
    // エディタが表示されるのを待つ
    await expect(page.locator('#editorContainer')).toHaveClass(/active/);
    
    // キャンバスに画像が表示される
    await expect(page.locator('#canvas')).toBeVisible();
    
    // サイズ表示が表示される
    await expect(page.locator('#sizeDisplay')).toBeVisible();
  });

  test('各ボタンが存在し、クリック可能', async ({ page }) => {
    // まず画像をアップロード
    await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'blue';
      ctx.fillRect(0, 0, 100, 100);
      const dataUrl = canvas.toDataURL('image/png');
      
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], {type: mime});
      const file = new File([blob], 'test.png', {type: mime});
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const fileInput = document.getElementById('fileInput');
      fileInput.files = dataTransfer.files;
      
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    });
    
    // エディタが表示されるのを待つ
    await expect(page.locator('#editorContainer')).toHaveClass(/active/);
    
    // 各ボタンが存在してクリック可能
    const buttons = [
      '#cropFreeBtn',
      '#crop10MBBtn',
      '#downloadBtn',
      '#resetBtn',
      '#newImageBtn'
    ];
    
    for (const buttonId of buttons) {
      const button = page.locator(buttonId);
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    }
  });

  test('品質スライダーが動作する', async ({ page }) => {
    // 画像をアップロード
    await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'green';
      ctx.fillRect(0, 0, 100, 100);
      const dataUrl = canvas.toDataURL('image/png');
      
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], {type: mime});
      const file = new File([blob], 'test.png', {type: mime});
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const fileInput = document.getElementById('fileInput');
      fileInput.files = dataTransfer.files;
      
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    });
    
    await expect(page.locator('#editorContainer')).toHaveClass(/active/);
    
    // スライダーを操作
    const slider = page.locator('#qualitySlider');
    await expect(slider).toBeVisible();
    
    // 値を変更
    await slider.fill('50');
    await expect(page.locator('#qualityValue')).toHaveText('50');
    
    await slider.fill('100');
    await expect(page.locator('#qualityValue')).toHaveText('100');
  });

  test('サイズ表示が更新される', async ({ page }) => {
    // 画像をアップロード
    await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'yellow';
      ctx.fillRect(0, 0, 200, 200);
      const dataUrl = canvas.toDataURL('image/png');
      
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], {type: mime});
      const file = new File([blob], 'test.png', {type: mime});
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const fileInput = document.getElementById('fileInput');
      fileInput.files = dataTransfer.files;
      
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    });
    
    await expect(page.locator('#editorContainer')).toHaveClass(/active/);
    
    // サイズ表示が表示される
    const sizeDisplay = page.locator('#sizeDisplay');
    await expect(sizeDisplay).toBeVisible();
    
    // サイズ情報が表示される
    await expect(page.locator('#currentSize')).toContainText('MB');
    await expect(page.locator('#resolution')).toContainText('x');
  });

  test('新しい画像を選択ボタンが動作する', async ({ page }) => {
    // 画像をアップロード
    await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'purple';
      ctx.fillRect(0, 0, 100, 100);
      const dataUrl = canvas.toDataURL('image/png');
      
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], {type: mime});
      const file = new File([blob], 'test.png', {type: mime});
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const fileInput = document.getElementById('fileInput');
      fileInput.files = dataTransfer.files;
      
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    });
    
    await expect(page.locator('#editorContainer')).toHaveClass(/active/);
    
    // 新しい画像を選択ボタンをクリック
    await page.click('#newImageBtn');
    
    // ドロップゾーンが再表示される
    await expect(page.locator('#dropZone')).toBeVisible();
    await expect(page.locator('#editorContainer')).not.toHaveClass(/active/);
  });

  test('ダウンロードボタンが動作する', async ({ page }) => {
    // 画像をアップロード
    await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'orange';
      ctx.fillRect(0, 0, 100, 100);
      const dataUrl = canvas.toDataURL('image/png');
      
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], {type: mime});
      const file = new File([blob], 'test.png', {type: mime});
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const fileInput = document.getElementById('fileInput');
      fileInput.files = dataTransfer.files;
      
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    });
    
    await expect(page.locator('#editorContainer')).toHaveClass(/active/);
    
    // ダウンロードイベントを監視
    const downloadPromise = page.waitForEvent('download');
    
    // ダウンロード関数をモック
    await page.evaluate(() => {
      // URL.createObjectURLとrevokeObjectURLをモック
      const originalCreateObjectURL = URL.createObjectURL;
      const originalRevokeObjectURL = URL.revokeObjectURL;
      let createdUrl = null;
      
      URL.createObjectURL = (blob) => {
        createdUrl = 'blob:mock-url';
        return createdUrl;
      };
      
      URL.revokeObjectURL = (url) => {
        // モック実装
      };
      
      // クリックイベントをキャプチャしてダウンロードが呼ばれたことを確認
      window.downloadCalled = false;
      const originalClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function() {
        if (this.download && this.download.includes('trimmed_image')) {
          window.downloadCalled = true;
        }
        // 実際のクリックは実行しない（ダウンロードダイアログを避ける）
      };
    });
    
    // ダウンロードボタンをクリック
    await page.click('#downloadBtn');
    
    // ダウンロード関数が呼ばれたことを確認
    const downloadCalled = await page.evaluate(() => window.downloadCalled);
    expect(downloadCalled).toBe(true);
  });
});