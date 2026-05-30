import { Popup } from './Popup';
import { Button } from './Button';
import { Text, TextStyle, Container, Graphics } from 'pixi.js';
import { useGameStore } from '../systems/stateStore';
import { SoundManager } from '../systems/SoundManager';

export class QuestsPopup extends Popup {
  private contentContainer!: Container;

  constructor() {
    super('NHIỆM VỤ & THÀNH TỰU', 440, 640);
    this.createContent();
  }

  private createContent(): void {
    this.contentContainer = new Container();
    this.contentContainer.y = -220;
    this.container.addChild(this.contentContainer);
    this.drawList();
  }

  private drawList(): void {
    this.contentContainer.removeChildren();
    const store = useGameStore.getState();

    // 1. Title section for Quests
    const sectionStyle = new TextStyle({
      fontFamily: 'Space Grotesk',
      fontSize: 18,
      fontWeight: 'bold',
      fill: 0x00f2fe,
    });
    
    const questsHeader = new Text({ text: '✦ NHIỆM VỤ', style: sectionStyle });
    questsHeader.x = -190;
    questsHeader.y = 0;
    this.contentContainer.addChild(questsHeader);

    let currentY = 30;
    const rowHeight = 70;

    // Draw Quests
    store.quests.forEach((q) => {
      const qRow = new Container();
      qRow.x = 0;
      qRow.y = currentY;

      const qBox = new Graphics();
      qBox.roundRect(-190, 0, 380, 60, 10);
      qBox.fill({ color: 0x0f0f20, alpha: 0.8 });
      qBox.stroke({ color: q.completed ? 0x39ff14 : 0x00f2fe, width: 1.5, alpha: q.completed ? 0.8 : 0.3 });
      qRow.addChild(qBox);

      // Quest Description
      const descStyle = new TextStyle({
        fontFamily: 'Outfit',
        fontSize: 13,
        fontWeight: '600',
        fill: 0xffffff,
      });
      const descTxt = new Text({ text: q.desc, style: descStyle });
      descTxt.x = -175;
      descTxt.y = 10;
      qRow.addChild(descTxt);

      // Progress bar
      const progressPercent = Math.min(1, q.current / q.target);
      const progBg = new Graphics();
      progBg.roundRect(-175, 34, 210, 12, 6);
      progBg.fill({ color: 0x1f1f3a });
      qRow.addChild(progBg);

      const progFill = new Graphics();
      if (progressPercent > 0) {
        progFill.roundRect(-175, 34, 210 * progressPercent, 12, 6);
        progFill.fill({ color: q.completed ? 0x39ff14 : 0x00f2fe });
      }
      qRow.addChild(progFill);

      const progText = new Text({
        text: `${q.current}/${q.target}`,
        style: new TextStyle({ fontFamily: 'Outfit', fontSize: 10, fill: 0xffffff, fontWeight: 'bold' }),
      });
      progText.anchor.set(0.5);
      progText.x = -70;
      progText.y = 40;
      qRow.addChild(progText);

      // Claim / Completed button
      if (q.completed) {
        const claimBtn = new Button({
          text: `NHẬN 💎${q.reward}`,
          width: 110,
          height: 32,
          fontSize: 10,
          bgColor: 0x103015,
          borderColor: 0x39ff14,
          glowColor: 0x39ff14,
          onClick: () => {
            SoundManager.playPerfectClear();
            useGameStore.getState().claimQuestReward(q.id);
            this.drawList(); // Redraw
          },
        });
        claimBtn.x = 120;
        claimBtn.y = 30;
        qRow.addChild(claimBtn);
      } else {
        const rewardText = new Text({
          text: `💎 ${q.reward}`,
          style: new TextStyle({ fontFamily: 'Space Grotesk', fontSize: 13, fill: 0xffd700, fontWeight: 'bold' }),
        });
        rewardText.anchor.set(0.5);
        rewardText.x = 120;
        rewardText.y = 30;
        qRow.addChild(rewardText);
      }

      this.contentContainer.addChild(qRow);
      currentY += rowHeight;
    });

    // 2. Achievements Section
    currentY += 15;
    const achHeader = new Text({ text: '✦ THÀNH TỰU', style: { ...sectionStyle, fill: 0xa855f7 } });
    achHeader.x = -190;
    achHeader.y = currentY;
    this.contentContainer.addChild(achHeader);
    currentY += 30;

    // Draw Achievements
    store.achievements.forEach((a) => {
      const aRow = new Container();
      aRow.x = 0;
      aRow.y = currentY;

      const aBox = new Graphics();
      aBox.roundRect(-190, 0, 380, 60, 10);
      aBox.fill({ color: 0x0f0f20, alpha: 0.8 });
      aBox.stroke({ color: a.completed ? 0xffd700 : 0xa855f7, width: 1.5, alpha: a.completed ? 0.8 : 0.3 });
      aRow.addChild(aBox);

      // Title & Desc
      const titleStyle = new TextStyle({
        fontFamily: 'Space Grotesk',
        fontSize: 13,
        fontWeight: 'bold',
        fill: a.completed ? 0xffd700 : 0xffffff,
      });
      const titleTxt = new Text({ text: `${a.title} ${a.completed ? '🏆' : ''}`, style: titleStyle });
      titleTxt.x = -175;
      titleTxt.y = 8;
      aRow.addChild(titleTxt);

      const descStyle = new TextStyle({
        fontFamily: 'Outfit',
        fontSize: 10,
        fill: 0x9090af,
      });
      const descTxt = new Text({ text: a.desc, style: descStyle });
      descTxt.x = -175;
      descTxt.y = 26;
      aRow.addChild(descTxt);

      // Progress bar
      const progressPercent = Math.min(1, a.current / a.target);
      const progBg = new Graphics();
      progBg.roundRect(-175, 42, 220, 8, 4);
      progBg.fill({ color: 0x1f1f3a });
      aRow.addChild(progBg);

      const progFill = new Graphics();
      if (progressPercent > 0) {
        progFill.roundRect(-175, 42, 220 * progressPercent, 8, 4);
        progFill.fill({ color: a.completed ? 0xffd700 : 0xa855f7 });
      }
      aRow.addChild(progFill);

      // Reward text
      const rewardTxt = new Text({
        text: `💎 ${a.reward}`,
        style: new TextStyle({ fontFamily: 'Space Grotesk', fontSize: 12, fill: 0xffd700, fontWeight: 'bold' }),
      });
      rewardTxt.anchor.set(0.5);
      rewardTxt.x = 120;
      rewardTxt.y = 30;
      aRow.addChild(rewardTxt);

      this.contentContainer.addChild(aRow);
      currentY += rowHeight;
    });
  }
}
