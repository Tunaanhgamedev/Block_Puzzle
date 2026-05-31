import { Popup } from './Popup';
import { Text, TextStyle, Container, Graphics } from 'pixi.js';

export class HowToPlayPopup extends Popup {
  private contentContainer!: Container;

  constructor() {
    super('HƯỚNG DẪN CHƠI', 450, 760);
    this.createContent();
  }

  private createContent(): void {
    this.contentContainer = new Container();
    this.contentContainer.y = -295;
    this.container.addChild(this.contentContainer);

    const titleStyle = new TextStyle({
      fontFamily: 'Space Grotesk',
      fontSize: 18,
      fontWeight: 'bold',
      fill: 0x00f2fe,
    });

    const bodyStyle = new TextStyle({
      fontFamily: 'Outfit',
      fontSize: 13,
      fill: 0xffffff,
      wordWrap: true,
      wordWrapWidth: 360,
      leading: 6,
    });


    let currentY = 10;

    // --- Section 1: Luật chơi ---
    const section1Header = new Text({ text: '✦ CÁCH CHƠI CƠ BẢN', style: titleStyle });
    section1Header.x = -190;
    section1Header.y = currentY;
    this.contentContainer.addChild(section1Header);
    currentY += 30;

    const ruleBox = new Graphics();
    ruleBox.roundRect(-190, currentY, 380, 130, 12);
    ruleBox.fill({ color: 0x0f0f20, alpha: 0.8 });
    ruleBox.stroke({ color: 0x00f2fe, width: 1.5, alpha: 0.3 });
    this.contentContainer.addChild(ruleBox);

    const ruleText = new Text({
      text: '• Kéo thả các khối gạch ở hàng dưới vào bàn cờ.\n' +
            '• Lấp đầy một hàng ngang hoặc hàng dọc để xóa chúng.\n' +
            '• Xóa nhiều hàng cùng lúc hoặc xóa liên tục các lượt để kích hoạt Combo nhân điểm số cực cao.\n' +
            '• Trò chơi kết thúc khi không còn chỗ trống để đặt gạch.',
      style: bodyStyle
    });
    ruleText.x = -175;
    ruleText.y = currentY + 12;
    this.contentContainer.addChild(ruleText);
    currentY += 150;

    // --- Section 2: Kỹ năng ---
    const section2Header = new Text({ text: '✦ KỸ NĂNG NEON', style: { ...titleStyle, fill: 0xa855f7 } });
    section2Header.x = -190;
    section2Header.y = currentY;
    this.contentContainer.addChild(section2Header);
    currentY += 30;

    const skills = [
      {
        icon: '🔨',
        name: 'BÚA NEON',
        desc: 'Nhấp kích hoạt Búa, sau đó nhấp vào ô gạch bất kỳ trên lưới để phá hủy ô gạch đó.',
        color: 0x00f2fe
      },
      {
        icon: '🔄',
        name: 'XOAY GẠCH',
        desc: 'Nhấp kích hoạt Xoay, sau đó nhấp vào một khối gạch ở khay để xoay khối gạch 90 độ.',
        color: 0x39ff14
      },
      {
        icon: '🔀',
        name: 'ĐỔI LẠI',
        desc: 'Nhấp đổi lập tức 3 khối gạch preview ở hàng dưới sang 3 khối gạch ngẫu nhiên mới.',
        color: 0xff6700
      },
      {
        icon: '⏪',
        name: 'HOÀN TÁC',
        desc: 'Quay ngược thời gian, khôi phục lại trạng thái bàn cờ và điểm số của lượt đi trước đó.',
        color: 0xfd6585
      }
    ];

    skills.forEach((skill) => {
      const skillRow = new Container();
      skillRow.y = currentY;

      // Card Background
      const card = new Graphics();
      card.roundRect(-190, 0, 380, 75, 10);
      card.fill({ color: 0x0f0f20, alpha: 0.8 });
      card.stroke({ color: skill.color, width: 1.5, alpha: 0.3 });
      skillRow.addChild(card);

      // Icon container box
      const iconBox = new Graphics();
      iconBox.roundRect(-175, 12, 48, 50, 8);
      iconBox.fill({ color: skill.color, alpha: 0.15 });
      iconBox.stroke({ color: skill.color, width: 1, alpha: 0.5 });
      skillRow.addChild(iconBox);

      // Icon Text
      const iconTxt = new Text({
        text: skill.icon,
        style: new TextStyle({ fontFamily: 'Space Grotesk', fontSize: 22, align: 'center' })
      });
      iconTxt.anchor.set(0.5);
      iconTxt.x = -151;
      iconTxt.y = 37;
      skillRow.addChild(iconTxt);

      // Skill Name
      const nameTxt = new Text({
        text: skill.name,
        style: new TextStyle({
          fontFamily: 'Space Grotesk',
          fontSize: 14,
          fontWeight: 'bold',
          fill: skill.color
        })
      });
      nameTxt.x = -115;
      nameTxt.y = 10;
      skillRow.addChild(nameTxt);

      // Skill Desc
      const descTxt = new Text({
        text: skill.desc,
        style: new TextStyle({
          fontFamily: 'Outfit',
          fontSize: 11,
          fill: 0xd0d0ef,
          wordWrap: true,
          wordWrapWidth: 285
        })
      });
      descTxt.x = -115;
      descTxt.y = 28;
      skillRow.addChild(descTxt);

      this.contentContainer.addChild(skillRow);
      currentY += 85;
    });
  }
}
