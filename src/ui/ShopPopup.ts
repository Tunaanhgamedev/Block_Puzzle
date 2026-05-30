import { Popup } from './Popup';
import { Button } from './Button';
import { Text, TextStyle, Container, Graphics } from 'pixi.js';
import { useGameStore } from '../systems/stateStore';
import { SoundManager } from '../systems/SoundManager';

export class ShopPopup extends Popup {
  private gemText!: Text;
  private itemsContainer!: Container;

  constructor() {
    super('CỬA HÀNG NEON', 440, 620);
    this.createContent();
  }

  private createContent(): void {
    const store = useGameStore.getState();

    // 1. Gems Display
    const gemStyle = new TextStyle({
      fontFamily: 'Space Grotesk',
      fontSize: 22,
      fontWeight: 'bold',
      fill: 0xffd700, // Gold
    });
    this.gemText = new Text({ text: `✨ NGỌC: ${store.gems}`, style: gemStyle });
    this.gemText.anchor.set(0.5);
    this.gemText.y = -220;
    this.container.addChild(this.gemText);

    // 2. Items List
    this.itemsContainer = new Container();
    this.itemsContainer.y = -170;
    this.container.addChild(this.itemsContainer);

    this.drawItems();
  }

  private drawItems(): void {
    this.itemsContainer.removeChildren();
    const store = useGameStore.getState();

    const shopItems = [
      { type: 'hammer', name: '⚡ BÚA NEON', desc: 'Phá hủy một ô gạch bất kỳ', cost: 100, count: store.hammers, color: 0x00f2fe },
      { type: 'rotate', name: '🔄 XOAY GẠCH', desc: 'Xoay khối gạch trước khi đặt', cost: 50, count: store.rotates, color: 0x39ff14 },
      { type: 'shuffle', name: '🔀 ĐỔI LẠI', desc: 'Đổi ngẫu nhiên 3 khối gạch mới', cost: 120, count: store.shuffles, color: 0xff6700 },
      { type: 'undo', name: '⏪ HOÀN TÁC', desc: 'Quay lại lượt đi trước đó', cost: 150, count: store.undos, color: 0xfd6585 },
    ] as const;

    const rowHeight = 85;

    shopItems.forEach((item, idx) => {
      const itemRow = new Container();
      itemRow.y = idx * rowHeight;

      // Item Box background
      const box = new Graphics();
      box.roundRect(-190, 0, 380, 75, 12);
      box.fill({ color: 0x111126, alpha: 0.8 });
      box.stroke({ color: item.color, width: 1.5, alpha: 0.5 });
      itemRow.addChild(box);

      // Name & Desc
      const titleStyle = new TextStyle({
        fontFamily: 'Space Grotesk',
        fontSize: 16,
        fontWeight: 'bold',
        fill: item.color,
      });
      const nameTxt = new Text({ text: `${item.name} (${item.count})`, style: titleStyle });
      nameTxt.x = -175;
      nameTxt.y = 12;
      itemRow.addChild(nameTxt);

      const descStyle = new TextStyle({
        fontFamily: 'Outfit',
        fontSize: 12,
        fill: 0xb0b0cf,
      });
      const descTxt = new Text({ text: item.desc, style: descStyle });
      descTxt.x = -175;
      descTxt.y = 35;
      itemRow.addChild(descTxt);

      // Buy Button
      const buyBtn = new Button({
        text: `💎 ${item.cost}`,
        width: 90,
        height: 34,
        fontSize: 12,
        bgColor: 0x1a1a36,
        borderColor: 0xffd700,
        glowColor: 0xffd700,
        onClick: () => {
          const success = useGameStore.getState().buyPowerup(item.type, item.cost);
          if (success) {
            SoundManager.playSkill();
            // Refresh counts & gems
            this.gemText.text = `✨ NGỌC: ${useGameStore.getState().gems}`;
            this.drawItems();
          } else {
            // Flash red on gem text
            SoundManager.playGameOver();
          }
        },
      });
      buyBtn.x = 130;
      buyBtn.y = 37;
      itemRow.addChild(buyBtn);

      this.itemsContainer.addChild(itemRow);
    });
  }
}
